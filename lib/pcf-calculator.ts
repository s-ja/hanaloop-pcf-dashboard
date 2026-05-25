/**
 * PCF 계산 로직 (순수 함수)
 *
 * 본 파일은 활동 데이터(ActivityData)와 배출계수(EmissionFactor)로부터
 * 제품탄소발자국(PCF)을 계산하는 순수 함수들을 정의합니다.
 *
 * 계산 공식 (docs/DOMAIN.md 2-1):
 *   PCF = Σ (활동량 × 해당 배출계수)
 *
 * 설계 원칙 (docs/PLANNING.md 6-2-1):
 *   - 외부 npm 의존성 없음. 입력에만 의존하고 부수 효과가 없는 순수 함수.
 *   - 배출계수는 인자로 주입받습니다. 값의 단일 진실의 출처(SSOT)는
 *     lib/constants.ts 의 EMISSION_FACTORS 이며, 호출부가 이를 전달합니다.
 *     (계산기를 mock-data/constants 에 직접 결합시키지 않아 테스트·재사용 용이)
 *   - Phase 1 → Phase 2(API Routes) → Bonus(DB) 전 단계에서 본 파일은 불변.
 *     서버(API Routes)와 클라이언트가 동일 함수를 재사용합니다.
 *
 * 동일 월 중복 활동 처리 (docs/DOMAIN.md 4장):
 *   동일 (기간, 카테고리) 의 복수 활동은 합산됩니다. 유니크 제약 없이 각 행을
 *   별개 레코드로 취급하고 집계 시 더합니다.
 */

import type {
  ActivityCategory,
  ActivityData,
  EmissionFactor,
  PCFCalculationResult,
  PCFTrendPoint,
} from "@/types";

/* ============================================================================
 * 내부 유틸
 * ============================================================================ */

/** 배출량 반올림 자릿수 — kgCO₂e 기준 소수 3자리(=그램 단위)까지 보존 */
const ROUND_DECIMALS = 3;

/**
 * 부동소수점 오차를 제거하기 위한 반올림.
 *
 * 예: 221 × 0.456 은 자바스크립트에서 100.77600000000001 이 될 수 있으므로
 * 도메인에 적절한 정밀도(소수 3자리)로 반올림하여 결과의 결정성을 보장합니다.
 */
const round = (value: number, decimals: number = ROUND_DECIMALS): number => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** 빈 카테고리별 집계 객체 생성 */
const emptyBreakdown = (): PCFCalculationResult["breakdown"] => ({
  electricity: 0,
  material: 0,
  transport: 0,
});

/** EmissionFactor 배열을 id 기준 조회 Map 으로 변환 */
const buildFactorMap = (
  emissionFactors: readonly EmissionFactor[],
): Map<string, EmissionFactor> =>
  new Map(emissionFactors.map((factor) => [factor.id, factor]));

/* ============================================================================
 * 기간 유틸
 * ============================================================================ */

/**
 * ISO 날짜 문자열에서 월 단위 기간 키('YYYY-MM')를 추출합니다.
 *
 * @param isoDate 'YYYY-MM-DD' 형식의 날짜
 * @returns 'YYYY-MM'
 */
export const getMonthlyPeriodKey = (isoDate: string): string =>
  isoDate.slice(0, 7);

/**
 * 활동 일자가 주어진 기간에 속하는지 판별합니다.
 *
 * 기간 식별자는 'YYYY'(연간) 또는 'YYYY-MM'(월별) 형식을 지원합니다.
 *
 * @param isoDate 활동 일자 ('YYYY-MM-DD')
 * @param period 'YYYY' 또는 'YYYY-MM'
 */
export const matchesPeriod = (isoDate: string, period: string): boolean =>
  isoDate.startsWith(period);

/**
 * 제품 ID와 기간으로 활동 데이터를 필터링합니다.
 *
 * @param activities 전체 활동 데이터
 * @param options.productId 제품 ID (미지정 시 전체 제품)
 * @param options.period 기간 ('YYYY' | 'YYYY-MM', 미지정 시 전체 기간)
 */
export const filterActivities = (
  activities: readonly ActivityData[],
  options: { productId?: string; period?: string } = {},
): ActivityData[] => {
  const { productId, period } = options;
  return activities.filter((activity) => {
    if (productId && activity.productId !== productId) return false;
    if (period && !matchesPeriod(activity.date, period)) return false;
    return true;
  });
};

/* ============================================================================
 * 단일 활동 배출량
 * ============================================================================ */

/**
 * 단일 활동의 배출량을 계산합니다: 활동량 × 배출계수값.
 *
 * @param activity 활동 데이터
 * @param factor 해당 배출계수
 * @returns 배출량 (kgCO₂e, 반올림 전 원시값)
 */
export const calculateActivityEmission = (
  activity: ActivityData,
  factor: EmissionFactor,
): number => activity.amount * factor.value;

/* ============================================================================
 * PCF 집계
 * ============================================================================ */

/**
 * 주어진 활동 데이터 집합의 PCF를 카테고리별로 집계합니다.
 *
 * 동일 카테고리의 복수 활동(예: 5월 중복 행)은 합산됩니다.
 *
 * @param activities 집계 대상 활동 데이터 (이미 필터링된 집합)
 * @param emissionFactors 배출계수 마스터 (SSOT: constants.ts 의 EMISSION_FACTORS)
 * @param options.productId 결과에 기록할 제품 ID (기본값: 첫 활동의 productId)
 * @param options.period 결과에 기록할 기간 식별자 (기본값: '')
 * @returns PCFCalculationResult
 * @throws 활동이 참조하는 emissionFactorId 가 마스터에 없을 경우
 */
export const calculatePCF = (
  activities: readonly ActivityData[],
  emissionFactors: readonly EmissionFactor[],
  options: { productId?: string; period?: string } = {},
): PCFCalculationResult => {
  const factorMap = buildFactorMap(emissionFactors);
  const breakdown = emptyBreakdown();
  const usedVersions = new Set<string>();

  for (const activity of activities) {
    const factor = factorMap.get(activity.emissionFactorId);
    if (!factor) {
      throw new Error(
        `배출계수를 찾을 수 없습니다: activity '${activity.id}' 가 참조하는 ` +
          `emissionFactorId '${activity.emissionFactorId}' 가 마스터에 없습니다.`,
      );
    }

    const category: ActivityCategory = activity.category;
    breakdown[category] += calculateActivityEmission(activity, factor);
    usedVersions.add(factor.version);
  }

  // 부동소수점 오차 제거 — 각 카테고리 반올림 후 합산
  breakdown.electricity = round(breakdown.electricity);
  breakdown.material = round(breakdown.material);
  breakdown.transport = round(breakdown.transport);

  const totalPCF = round(
    breakdown.electricity + breakdown.material + breakdown.transport,
  );

  return {
    productId: options.productId ?? activities[0]?.productId ?? "",
    period: options.period ?? "",
    breakdown,
    totalPCF,
    emissionFactorVersions: [...usedVersions].sort(),
    activityCount: activities.length,
  };
};

/**
 * 특정 제품·기간의 PCF를 계산합니다 (필터링 + 집계 결합 편의 함수).
 *
 * @param activities 전체 활동 데이터
 * @param emissionFactors 배출계수 마스터
 * @param productId 제품 ID
 * @param period 기간 ('YYYY' | 'YYYY-MM')
 */
export const calculatePCFForPeriod = (
  activities: readonly ActivityData[],
  emissionFactors: readonly EmissionFactor[],
  productId: string,
  period: string,
): PCFCalculationResult => {
  const filtered = filterActivities(activities, { productId, period });
  return calculatePCF(filtered, emissionFactors, { productId, period });
};

/* ============================================================================
 * 시계열 트렌드
 * ============================================================================ */

/**
 * 제품의 월별 PCF 시계열 데이터를 생성합니다.
 *
 * 활동 데이터에 존재하는 모든 월(YYYY-MM)에 대해 PCF를 계산하고 기간 오름차순으로
 * 정렬하여 반환합니다. PCFTrendChart 컴포넌트의 입력으로 사용됩니다.
 *
 * @param activities 전체 활동 데이터
 * @param emissionFactors 배출계수 마스터
 * @param productId 제품 ID
 * @returns 기간 오름차순 PCFTrendPoint 배열
 */
export const buildMonthlyTrend = (
  activities: readonly ActivityData[],
  emissionFactors: readonly EmissionFactor[],
  productId: string,
): PCFTrendPoint[] => {
  const productActivities = filterActivities(activities, { productId });

  // 데이터에 등장하는 월 목록 (중복 제거)
  const periods = [
    ...new Set(productActivities.map((a) => getMonthlyPeriodKey(a.date))),
  ].sort();

  return periods.map((period) => {
    const result = calculatePCFForPeriod(
      activities,
      emissionFactors,
      productId,
      period,
    );
    return {
      period,
      totalPCF: result.totalPCF,
      breakdown: result.breakdown,
    };
  });
};
