/**
 * 도메인 상수 (Single Source of Truth)
 *
 * 본 파일은 배출계수의 단일 진실의 출처입니다.
 * mock-data.ts, pcf-calculator.ts, 그리고 (Phase 2 이후) API Routes 모두 이
 * 파일에서 배출계수 값을 import 합니다.
 *
 * 값의 출처: 2026년_개발자_채용과제.xlsx — "과제용 데이터" 시트 우측 배출계수 표
 * 도메인 근거: docs/DOMAIN.md 3장
 *
 * 본 파일은 Phase 1 → Phase 2 → Bonus 모든 단계에서 변경되지 않는 것이 설계
 * 원칙입니다. 배출계수 값이 변경될 경우 본 파일 한 곳만 수정하면 됩니다.
 */

import type { EmissionFactor } from "@/types";

/* ============================================================================
 * 배출계수 정의
 * ============================================================================
 *
 * 과제 엑셀 "과제용 데이터" 시트의 배출계수 표:
 *   - 전기 (한국전력 기본값):   0.456 kgCO₂e / kWh
 *   - 원소재 (플라스틱 1):       2.3   kgCO₂e / kg
 *   - 원소재 (플라스틱 2):       3.2   kgCO₂e / kg
 *   - 운송 (트럭):              3.5   kgCO₂e / ton-km
 *
 * Scope 매핑은 docs/DOMAIN.md 2-2 결정에 따라 레코드 단위로 부여합니다.
 * 운송(트럭)은 과제 데이터에서 방향이 명시되지 않아 업스트림으로 일괄 부여
 * 합니다. 실제 환경에서는 운송 방향별 별개 EmissionFactor 레코드를 추가하여
 * 대응 가능합니다.
 */

/** 배출계수 ID 상수 — 코드 전반에서 문자열 매직값 대신 사용 */
export const EMISSION_FACTOR_ID = {
  ELECTRICITY_KEPCO: "EF_ELECTRICITY_KEPCO_2025",
  MATERIAL_PLASTIC_1: "EF_MATERIAL_PLASTIC_1_2025",
  MATERIAL_PLASTIC_2: "EF_MATERIAL_PLASTIC_2_2025",
  TRANSPORT_TRUCK: "EF_TRANSPORT_TRUCK_2025",
} as const;

/** 본 과제 데이터의 유효 시작일 (모든 배출계수가 2025년 기준) */
const VALID_FROM_2025 = "2025-01-01";

/**
 * 배출계수 마스터 데이터
 *
 * 사용처 매칭은 (category, source) 조합으로 이루어집니다.
 * 예: ActivityData.category='electricity' + description='한국전력'
 *     → category='electricity' + source='한국전력' 인 EmissionFactor
 */
export const EMISSION_FACTORS: readonly EmissionFactor[] = [
  {
    id: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    category: "electricity",
    source: "한국전력",
    value: 0.456,
    unit: "kgCO₂e/kWh",
    version: "KEPCO-2025",
    validFrom: VALID_FROM_2025,
    scope: "scope2",
  },
  {
    id: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    category: "material",
    source: "플라스틱 1",
    value: 2.3,
    unit: "kgCO₂e/kg",
    version: "DEFAULT-2025",
    validFrom: VALID_FROM_2025,
    scope: "scope3_upstream",
  },
  {
    id: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_2,
    category: "material",
    source: "플라스틱 2",
    value: 3.2,
    unit: "kgCO₂e/kg",
    version: "DEFAULT-2025",
    validFrom: VALID_FROM_2025,
    scope: "scope3_upstream",
  },
  {
    id: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    category: "transport",
    source: "트럭",
    value: 3.5,
    unit: "kgCO₂e/ton-km",
    version: "DEFAULT-2025",
    validFrom: VALID_FROM_2025,
    scope: "scope3_upstream",
  },
] as const;

/* ============================================================================
 * 조회 헬퍼 — (category, source) → EmissionFactor
 * ============================================================================
 *
 * pcf-calculator 및 컴포넌트에서 활동 데이터에 해당하는 배출계수를 찾을 때
 * 사용합니다. 사전 빌드된 Map으로 O(1) 조회를 보장합니다.
 */

/** 내부 조회 키 생성 함수 */
const buildLookupKey = (category: string, source: string): string =>
  `${category}::${source}`;

/** (category, source) → EmissionFactor Map */
const emissionFactorMap: ReadonlyMap<string, EmissionFactor> = new Map(
  EMISSION_FACTORS.map((ef) => [buildLookupKey(ef.category, ef.source), ef]),
);

/**
 * 활동 카테고리와 설명으로 배출계수를 조회합니다.
 *
 * @param category 활동 카테고리
 * @param source 활동 설명 (= EmissionFactor.source)
 * @returns 해당하는 EmissionFactor, 없으면 undefined
 */
export const findEmissionFactor = (
  category: string,
  source: string,
): EmissionFactor | undefined => {
  return emissionFactorMap.get(buildLookupKey(category, source));
};

/* ============================================================================
 * 기타 도메인 상수
 * ============================================================================ */

/** 본 과제 대상 제품 ID */
export const DEFAULT_PRODUCT_ID = "CT-045";

/** 본 과제 대상 제품 이름 */
export const DEFAULT_PRODUCT_NAME = "컴퓨터 화면 CT-045";
