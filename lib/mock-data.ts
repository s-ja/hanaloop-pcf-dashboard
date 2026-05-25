/**
 * Mock 데이터 — 과제 엑셀 "과제용 데이터" 시트의 활동 데이터를 TypeScript로 변환
 *
 * 출처: 2026년_개발자_채용과제.xlsx — "과제용 데이터" 시트
 * 대상 제품: 컴퓨터 화면 CT-045
 * 기간: 2025-01 ~ 2025-08
 *
 * 본 파일은 Phase 1에서 컴포넌트가 직접 import 합니다.
 * Phase 2에서는 API Routes 내부에서만 참조되며 (lib/api-client.ts 가 클라이언트
 * 호출을 대신함), Bonus 단계에서는 PostgreSQL 시드 데이터로 대체됩니다.
 *
 * 도메인 근거: docs/DOMAIN.md 4장
 * 인터페이스 근거: docs/PLANNING.md 4-1
 *
 * 주요 결정 사항:
 * 1) 2025-05월에 동일 활동유형 중복 행이 의도적으로 존재 (docs/DOMAIN.md 4장)
 *    - 전기 한국전력: 120 kWh + 101 kWh
 *    - 원소재 플라스틱 1: 424 kg + 232 kg
 *    - 운송 트럭: 123 ton-km + 12 ton-km
 *    각 행은 별개 ActivityData 레코드로 저장하고 집계 시 합산합니다.
 *
 * 2) date 필드는 일 단위까지 보존하되, 월 단위 집계가 기본입니다.
 *
 * 3) createdAt은 본 mock 데이터에서는 데이터 일자와 동일하게 부여합니다.
 *    실제 환경에서는 사용자가 입력한 시점이 별도로 기록됩니다.
 */

import type { ActivityData, Product } from "@/types";
import {
  DEFAULT_PRODUCT_ID,
  DEFAULT_PRODUCT_NAME,
  EMISSION_FACTOR_ID,
} from "./constants";

/* ============================================================================
 * 제품 데이터
 * ============================================================================ */

export const MOCK_PRODUCTS: readonly Product[] = [
  {
    id: DEFAULT_PRODUCT_ID,
    name: DEFAULT_PRODUCT_NAME,
    unit: "개",
    // targetPCF는 과제 데이터에 명시되지 않아 미설정.
    // 경영자 페르소나의 목표 진척도 컴포넌트는 이 값이 있을 때만 활성화됨.
  },
] as const;

/* ============================================================================
 * 활동 데이터
 * ============================================================================
 *
 * 엑셀 원본 컬럼: 일자(원본) | 활동유형 | 설명 | 량 | 단위
 * 변환 규칙:
 *   - 활동유형 '전기'    → category: 'electricity', unit: 'kWh'
 *   - 활동유형 '원소재'  → category: 'material',    unit: 'kg'
 *   - 활동유형 '운송'    → category: 'transport',   unit: 'ton-km'
 *   - 설명 '한국전력'     → EMISSION_FACTOR_ID.ELECTRICITY_KEPCO
 *   - 설명 '플라스틱 1'   → EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1
 *   - 설명 '플라스틱 2'   → EMISSION_FACTOR_ID.MATERIAL_PLASTIC_2
 *   - 설명 '트럭'         → EMISSION_FACTOR_ID.TRANSPORT_TRUCK
 *
 * ID 부여 규칙:
 *   'ACT_{YYYY}_{MM}_{category 접두}_{순번}'
 *   동일 월 내 중복 행이 있으므로 순번으로 구분합니다.
 *   접두: E (electricity), M (material), T (transport)
 */

export const MOCK_ACTIVITY_DATA: readonly ActivityData[] = [
  /* ───── 전기 (electricity) — 8건 (1월 데이터 없음, 5월 중복 1건 포함) ───── */
  {
    id: "ACT_2025_02_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-02-01",
    amount: 112,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-02-01T00:00:00Z",
  },
  {
    id: "ACT_2025_03_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-03-01",
    amount: 115,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "ACT_2025_04_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-04-01",
    amount: 130,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-04-01T00:00:00Z",
  },
  {
    id: "ACT_2025_05_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-05-01",
    amount: 120,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-05-01T00:00:00Z",
  },
  // 5월 중복 행 — 의도된 데이터 (docs/DOMAIN.md 4장)
  {
    id: "ACT_2025_05_E_02",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-05-01",
    amount: 101,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "ACT_2025_06_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-06-01",
    amount: 110,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "ACT_2025_07_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-07-01",
    amount: 120,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-07-01T00:00:00Z",
  },
  {
    id: "ACT_2025_08_E_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "electricity",
    description: "한국전력",
    date: "2025-08-01",
    amount: 111,
    unit: "kWh",
    emissionFactorId: EMISSION_FACTOR_ID.ELECTRICITY_KEPCO,
    createdAt: "2025-08-01T00:00:00Z",
  },

  /* ───── 원소재 (material) — 12건 ───── */
  {
    id: "ACT_2025_01_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-01-01",
    amount: 230,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ACT_2025_02_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-02-01",
    amount: 340,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-02-01T00:00:00Z",
  },
  {
    id: "ACT_2025_03_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 2",
    date: "2025-03-01",
    amount: 23,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_2,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "ACT_2025_03_M_02",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-03-01",
    amount: 430,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "ACT_2025_04_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-04-01",
    amount: 510,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-04-01T00:00:00Z",
  },
  {
    id: "ACT_2025_05_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-05-01",
    amount: 424,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "ACT_2025_05_M_02",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 2",
    date: "2025-05-01",
    amount: 40,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_2,
    createdAt: "2025-05-01T00:00:00Z",
  },
  // 5월 플라스틱 1 중복 행 — 의도된 데이터 (docs/DOMAIN.md 4장)
  {
    id: "ACT_2025_05_M_03",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-05-01",
    amount: 232,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "ACT_2025_06_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-06-01",
    amount: 450,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "ACT_2025_07_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-07-01",
    amount: 340,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-07-01T00:00:00Z",
  },
  {
    id: "ACT_2025_07_M_02",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 2",
    date: "2025-07-01",
    amount: 43,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_2,
    createdAt: "2025-07-01T00:00:00Z",
  },
  {
    id: "ACT_2025_08_M_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "material",
    description: "플라스틱 1",
    date: "2025-08-01",
    amount: 230,
    unit: "kg",
    emissionFactorId: EMISSION_FACTOR_ID.MATERIAL_PLASTIC_1,
    createdAt: "2025-08-01T00:00:00Z",
  },

  /* ───── 운송 (transport) — 9건 ───── */
  {
    id: "ACT_2025_01_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-01-01",
    amount: 41,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ACT_2025_02_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-02-01",
    amount: 211,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-02-01T00:00:00Z",
  },
  {
    id: "ACT_2025_03_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-03-01",
    amount: 123,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "ACT_2025_04_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-04-01",
    amount: 42,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-04-01T00:00:00Z",
  },
  {
    id: "ACT_2025_05_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-05-01",
    amount: 123,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-05-01T00:00:00Z",
  },
  // 5월 트럭 중복 행 — 의도된 데이터 (docs/DOMAIN.md 4장)
  {
    id: "ACT_2025_05_T_02",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-05-01",
    amount: 12,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "ACT_2025_06_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-06-01",
    amount: 123,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "ACT_2025_07_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-07-01",
    amount: 41,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-07-01T00:00:00Z",
  },
  {
    id: "ACT_2025_08_T_01",
    productId: DEFAULT_PRODUCT_ID,
    category: "transport",
    description: "트럭",
    date: "2025-08-01",
    amount: 123,
    unit: "ton-km",
    emissionFactorId: EMISSION_FACTOR_ID.TRANSPORT_TRUCK,
    createdAt: "2025-08-01T00:00:00Z",
  },
] as const;

/* ============================================================================
 * 데이터 요약 (개발 시 참고용 — 런타임에 사용되지 않음)
 * ============================================================================
 *
 * 총 활동 데이터 건수: 29건
 *   - 전기:   8건 (1월 데이터 없음, 5월에 1건 중복 포함)
 *   - 원소재: 12건 (5월에 1건 중복 포함)
 *   - 운송:   9건 (5월에 1건 중복 포함)
 *
 * 검증 — 2025년 5월 PCF 계산 (docs/DOMAIN.md 2-1)
 *   전기:   (120 + 101) kWh    × 0.456 = 100.776 kgCO₂e
 *   원소재: (424 + 232) kg     × 2.3
 *           + 40 kg            × 3.2   = 1,636.8 kgCO₂e
 *   운송:   (123 + 12) ton-km  × 3.5   =   472.5 kgCO₂e
 *   ─────────────────────────────────────────
 *   5월 합계                            = 2,210.076 kgCO₂e
 *
 * 이 값은 pcf-calculator.ts 의 회귀 테스트 기준값으로 사용됩니다.
 */
