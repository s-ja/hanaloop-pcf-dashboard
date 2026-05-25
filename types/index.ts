/**
 * 도메인 타입 정의
 *
 * 본 파일은 HanaLoop PCF Dashboard의 전체 도메인 타입을 정의합니다.
 * 클라이언트, API Routes, mock-data, pcf-calculator 모두 이 파일을 참조합니다.
 *
 * 도메인 개념 근거: docs/DOMAIN.md
 * 인터페이스 설계 근거: docs/PLANNING.md 4-1
 *
 * 본 파일은 Phase 1 → Phase 2 (API Routes 도입) → Bonus (PostgreSQL 도입)
 * 모든 단계에서 변경되지 않는 것이 설계 원칙입니다.
 */

/* ============================================================================
 * 1. 활동 카테고리
 * ============================================================================ */

/**
 * 활동 카테고리 — 과제 데이터의 3대 카테고리
 *
 * 향후 가스·증기·지역난방 등 다른 에너지원이 추가되는 경우에도 본 타입의
 * 명명은 변경하지 않고 새로운 카테고리를 추가하는 방향으로 확장합니다.
 * (electricity → energy 같은 격상이 아닌 병렬 추가)
 */
export type ActivityCategory = "electricity" | "material" | "transport";

/** UI 표시용 한국어 라벨 매핑 */
export const ActivityCategoryLabel: Record<ActivityCategory, string> = {
  electricity: "전기",
  material: "원소재",
  transport: "운송",
};

/* ============================================================================
 * 2. GHG Scope 분류
 * ============================================================================ */

/**
 * GHG Protocol Scope 분류
 *
 * - scope1: 기업이 직접 통제하는 배출원 (본 과제 데이터에는 미포함)
 * - scope2: 구매한 에너지(전기·열·증기)에서의 간접 배출
 * - scope3_upstream: 가치사슬 업스트림 (원자재, 협력사 운송 등)
 * - scope3_downstream: 가치사슬 다운스트림 (제품 배송, 사용, 폐기 등)
 *
 * 본 과제 매핑은 docs/DOMAIN.md 2-2 참조.
 *
 * 카테고리 → Scope의 하드코딩 매핑은 두지 않습니다. 운송과 같이 동일 카테고리가
 * 업스트림/다운스트림 양쪽에 해당될 수 있으므로, scope 값은 각 EmissionFactor
 * 레코드 단위로 결정합니다.
 */
export type EmissionScope =
  | "scope1"
  | "scope2"
  | "scope3_upstream"
  | "scope3_downstream";

/** UI 표시용 Scope 라벨 매핑 */
export const EmissionScopeLabel: Record<EmissionScope, string> = {
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3_upstream: "Scope 3 (업스트림)",
  scope3_downstream: "Scope 3 (다운스트림)",
};

/* ============================================================================
 * 3. 단위
 * ============================================================================ */

/**
 * 활동량 단위 — 과제 데이터에서 사용되는 단위
 *
 * - kWh: 전기 사용량
 * - kg: 원소재 중량
 * - ton-km: 운송 (중량 × 거리)
 */
export type ActivityUnit = "kWh" | "kg" | "ton-km";

/**
 * 배출량 단위 — 본 과제 전 영역에서 kgCO₂e 로 통일
 *
 * 단위 통일 결정의 근거는 docs/DOMAIN.md 2-1 참조.
 */
export const EMISSION_UNIT = "kgCO₂e" as const;
export type EmissionUnit = typeof EMISSION_UNIT;

/**
 * 배출계수 단위 — 활동 단위와 배출량 단위의 비율
 *
 * 형태: '{EmissionUnit}/{ActivityUnit}'
 * 예: 'kgCO₂e/kWh', 'kgCO₂e/kg', 'kgCO₂e/ton-km'
 */
export type EmissionFactorUnit = `${EmissionUnit}/${ActivityUnit}`;

/* ============================================================================
 * 4. 배출계수 (EmissionFactor)
 * ============================================================================ */

/**
 * 배출계수
 *
 * 활동 데이터를 CO₂ 배출량으로 변환하는 계수.
 *
 * 본 과제 엑셀 원문 가이드: "💡 배출계수는 DB에 별도 테이블로 관리하고 버전 이력을
 * 추적하도록 설계하세요."
 *
 * 본 인터페이스의 version, validFrom 필드가 해당 가이드의 직접 대응입니다.
 * docs/DOMAIN.md 2-3 참조.
 */
export interface EmissionFactor {
  /** 고유 식별자: 예) 'EF_ELECTRICITY_KEPCO_2025' */
  id: string;

  /** 활동 카테고리 */
  category: ActivityCategory;

  /**
   * 사용처/소스 표시명. 활동 데이터의 description 필드와 매칭됨.
   * 예: '한국전력', '플라스틱 1', '플라스틱 2', '트럭'
   */
  source: string;

  /** 계수값 (수치) */
  value: number;

  /** 배출계수 단위: 'kgCO₂e/kWh' | 'kgCO₂e/kg' | 'kgCO₂e/ton-km' */
  unit: EmissionFactorUnit;

  /** 버전 식별자: 예) 'KEPCO-2025', 'DEFAULT-2025' */
  version: string;

  /** 유효 시작일 (ISO date string, YYYY-MM-DD) */
  validFrom: string;

  /** GHG Scope 매핑 — 레코드 단위로 결정 */
  scope: EmissionScope;
}

/* ============================================================================
 * 5. 활동 데이터 (ActivityData)
 * ============================================================================ */

/**
 * 활동 데이터
 *
 * 사용자가 입력하는 원본 활동 기록. 본 데이터에 배출계수를 곱하여 PCF가 계산됩니다.
 *
 * 동일한 (date, category, description) 조합에 대해 유니크 제약을 두지 않습니다.
 * 과제 데이터의 5월 중복 행을 정상 케이스로 처리하기 위함입니다.
 * docs/DOMAIN.md 4장 참조.
 */
export interface ActivityData {
  /** 고유 ID (생성 시 자동 부여) */
  id: string;

  /** 제품 ID. 본 과제는 'CT-045' 단일 제품 */
  productId: string;

  /** 활동 카테고리 */
  category: ActivityCategory;

  /**
   * 활동 설명. EmissionFactor.source 와 매칭되어 배출계수가 결정됨.
   * 예: '한국전력', '플라스틱 1', '플라스틱 2', '트럭'
   */
  description: string;

  /** 활동 일자 (ISO date string, YYYY-MM-DD). 월 단위 집계 기준 */
  date: string;

  /** 활동량 (수치) */
  amount: number;

  /** 활동 단위 — 카테고리별로 고정 (electricity: kWh, material: kg, transport: ton-km) */
  unit: ActivityUnit;

  /** 연결된 배출계수 ID */
  emissionFactorId: string;

  /** 레코드 생성 시각 (ISO datetime string) */
  createdAt: string;
}

/**
 * 활동 데이터 입력용 타입 — 사용자가 입력 폼에서 제공하는 값
 *
 * 입력 시점에 id와 createdAt은 서버/클라이언트가 자동 생성하므로 제외.
 */
export type ActivityDataInput = Omit<ActivityData, "id" | "createdAt">;

/* ============================================================================
 * 6. 제품 (Product)
 * ============================================================================ */

/**
 * 제품
 *
 * 본 과제 데이터는 단일 제품(CT-045)만 포함합니다.
 * 다중 제품 비교는 보너스 항목 "타 시스템과 비교"의 확장 경로로 데이터 모델에
 * 만 열어둡니다. docs/USER_RESEARCH.md 7장 참조.
 */
export interface Product {
  /** 제품 코드: 예) 'CT-045' */
  id: string;

  /** 제품 표시명: 예) '컴퓨터 화면 CT-045' */
  name: string;

  /** 경영자 목표 PCF값 (kgCO₂e / 제품 단위). 선택 필드 */
  targetPCF?: number;

  /** 제품 단위: '개', 'kg', 'ton' 등 */
  unit: string;
}

/* ============================================================================
 * 7. PCF 계산 결과
 * ============================================================================ */

/**
 * PCF 계산 결과 — 특정 기간의 카테고리별 + 총 배출량
 *
 * 본 객체는 ActivityData와 EmissionFactor로부터 런타임 계산됩니다.
 * 별도 영속 테이블로 두지 않습니다. docs/PLANNING.md 4-2 참조.
 */
export interface PCFCalculationResult {
  /** 제품 ID */
  productId: string;

  /** 집계 기간 식별자: 'YYYY-MM' (월별) 또는 'YYYY' (연간) */
  period: string;

  /** 카테고리별 배출량 (kgCO₂e) */
  breakdown: {
    /** 전기 — Scope 2 */
    electricity: number;
    /** 원소재 — Scope 3 업스트림 */
    material: number;
    /** 운송 — 본 과제 데이터에서는 Scope 3 업스트림으로 매핑 */
    transport: number;
  };

  /** 총 PCF (kgCO₂e) — breakdown 합계 */
  totalPCF: number;

  /**
   * 계산에 사용된 배출계수 버전 목록.
   * UI의 EmissionFactorBadge 컴포넌트 표시 + 보고 추적성에 활용.
   */
  emissionFactorVersions: string[];

  /** 집계에 포함된 ActivityData 개수 — 드릴다운 UI 표시용 */
  activityCount: number;
}

/**
 * 시계열 트렌드 차트용 데이터 포인트
 *
 * PCFTrendChart 컴포넌트가 사용합니다.
 */
export interface PCFTrendPoint {
  /** 기간 식별자: 'YYYY-MM' */
  period: string;

  /** 해당 기간의 총 PCF (kgCO₂e) */
  totalPCF: number;

  /** 해당 기간의 카테고리별 breakdown */
  breakdown: PCFCalculationResult["breakdown"];
}
