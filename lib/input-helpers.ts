/**
 * 입력 폼 보조 순수 함수
 *
 * ActivityInputForm 이 소비하는 "옵션 도출"과 "입력값 → 활동 데이터 변환" 로직을
 * UI/상태에서 분리한 순수 함수 모음입니다. 검증은 lib/validators 가, 계산은
 * lib/pcf-calculator 가 담당하며, 본 파일은 폼 고유의 표시/조립 보조만 둡니다.
 *
 * 설계 원칙 (CLAUDE.md 불변 제약):
 *   - 카테고리·배출원(설명)·단위 옵션은 모두 EMISSION_FACTORS 에서 "파생"합니다.
 *     하드코딩하지 않습니다(전기↔kWh 같은 매핑도 배출계수 단위에서 추출).
 *   - 외부 의존성이 없는 순수 함수이므로 vitest 로 직접 검증합니다.
 *
 * 도메인 근거: docs/DOMAIN.md 4장, docs/USER_RESEARCH.md 시나리오 1
 */

import type {
  ActivityCategory,
  ActivityData,
  ActivityDataInput,
  ActivityUnit,
  EmissionFactor,
} from "@/types";

/**
 * 배출계수 마스터에 등장하는 활동 카테고리 목록을 (입력 순서 기준, 중복 제거)
 * 반환합니다. 카테고리 select 옵션 구성에 사용합니다.
 */
export const getInputCategories = (
  emissionFactors: readonly EmissionFactor[],
): ActivityCategory[] => [
  ...new Set(emissionFactors.map((factor) => factor.category)),
];

/**
 * 특정 카테고리에 속하는 배출원(설명) 목록을 (중복 제거) 반환합니다.
 * 배출원 select 옵션 구성에 사용합니다.
 *
 * @example getSourceOptions(EMISSION_FACTORS, 'material') // ['플라스틱 1', '플라스틱 2']
 */
export const getSourceOptions = (
  emissionFactors: readonly EmissionFactor[],
  category: ActivityCategory,
): string[] => [
  ...new Set(
    emissionFactors
      .filter((factor) => factor.category === category)
      .map((factor) => factor.source),
  ),
];

/**
 * 카테고리에 해당하는 활동 단위를 배출계수 단위에서 도출합니다.
 *
 * 배출계수 단위는 '{배출단위}/{활동단위}' 형태이므로(예: 'kgCO₂e/kWh'),
 * '/' 뒤를 활동 단위로 추출합니다. 카테고리가 마스터에 없으면 undefined.
 * 이를 통해 전기↔kWh 같은 매핑을 하드코딩하지 않습니다.
 *
 * @example getUnitForCategory(EMISSION_FACTORS, 'electricity') // 'kWh'
 */
export const getUnitForCategory = (
  emissionFactors: readonly EmissionFactor[],
  category: ActivityCategory,
): ActivityUnit | undefined => {
  const factor = emissionFactors.find((f) => f.category === category);
  if (!factor) return undefined;
  return factor.unit.split("/")[1] as ActivityUnit;
};

/**
 * 검증을 통과한 입력값을 영속 형태의 ActivityData 로 변환합니다.
 *
 * id 와 createdAt 은 입력 시점에 존재하지 않으므로 호출부(페이지)가 생성하여
 * 주입합니다(클라이언트에서 crypto.randomUUID() + ISO now). 본 함수는 그 두
 * 값을 합쳐 ActivityData 를 조립하는 순수 변환만 담당합니다.
 *
 * Phase 1 범위상 이 결과는 페이지 인메모리 상태로만 보관되며 mock-data 를
 * 변형하지 않습니다(영속화는 Phase 2 api-client/POST).
 */
export const toActivityData = (
  input: ActivityDataInput,
  id: string,
  createdAt: string,
): ActivityData => ({
  ...input,
  id,
  createdAt,
});
