/**
 * 입력값 검증 순수 함수
 *
 * 데이터 입력 폼(Session 3 의 ActivityInputForm)이 소비할 검증 로직입니다.
 * UI/상태에 의존하지 않는 순수 함수이며, 필드별 한국어 에러 메시지 맵을
 * 반환합니다. (체크리스트 필수: 오류 입력 시 에러 메시지 표시)
 *
 * 설계 원칙:
 *   - 배출계수 값은 하드코딩하지 않고 findEmissionFactor 로 조회합니다.
 *     (SSOT: lib/constants.ts 의 EMISSION_FACTORS)
 *   - 카테고리별 기대 단위는 배출원과 무관하게 검사할 수 있어야 하므로 구조적
 *     매핑(CATEGORY_EXPECTED_UNIT)으로 둡니다. 이는 배출계수 '값'이 아니라
 *     ActivityUnit 타입에서 파생되는 단위 규칙입니다.
 *
 * 도메인 근거: docs/DOMAIN.md 4장, docs/USER_RESEARCH.md 3-1
 */

import type {
  ActivityCategory,
  ActivityDataInput,
  ActivityUnit,
} from "@/types";
import { ActivityCategoryLabel } from "@/types";
import { findEmissionFactor } from "@/lib/constants";

/**
 * 필드별 에러 메시지 맵. 값이 존재하는 키만 오류가 있는 필드입니다.
 * Session 3 입력 폼이 각 필드 옆에 메시지를 표시합니다.
 */
export interface ActivityInputErrors {
  category?: string;
  description?: string;
  date?: string;
  amount?: string;
  unit?: string;
}

/** 유효한 활동 카테고리 집합 */
const VALID_CATEGORIES: readonly ActivityCategory[] = [
  "electricity",
  "material",
  "transport",
];

/**
 * 카테고리별 기대 활동 단위.
 * electricity↔kWh, material↔kg, transport↔ton-km 정합성 검사에 사용합니다.
 */
const CATEGORY_EXPECTED_UNIT: Record<ActivityCategory, ActivityUnit> = {
  electricity: "kWh",
  material: "kg",
  transport: "ton-km",
};

/** 'YYYY-MM-DD' 형식이며 실제 달력상 존재하는 날짜인지 검사합니다. */
const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // 2025-02-30 같은 비존재 날짜를 거르기 위해 왕복 변환을 확인합니다.
  return parsed.toISOString().slice(0, 10) === value;
};

/**
 * 활동 데이터 입력값을 검증하고 필드별 에러 메시지 맵을 반환합니다.
 *
 * 입력 도중 일부 필드가 비어 있을 수 있으므로 Partial 을 받습니다.
 * 오류가 없으면 빈 객체({})를 반환합니다.
 *
 * @param input 검증할 활동 데이터 입력값 (부분 입력 허용)
 */
export const validateActivityInput = (
  input: Partial<ActivityDataInput>,
): ActivityInputErrors => {
  const errors: ActivityInputErrors = {};

  const { category, description, date, amount, unit } = input;

  /* ── 카테고리 ── */
  const hasValidCategory =
    category !== undefined &&
    VALID_CATEGORIES.includes(category as ActivityCategory);
  if (category === undefined || category === null) {
    errors.category = "활동 카테고리를 선택하세요.";
  } else if (!hasValidCategory) {
    errors.category = "알 수 없는 활동 카테고리입니다.";
  }

  /* ── 활동량(amount) ── */
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    errors.amount = "활동량을 입력하세요.";
  } else if (!Number.isFinite(amount)) {
    errors.amount = "활동량은 유효한 숫자여야 합니다.";
  } else if (amount <= 0) {
    errors.amount = "활동량은 0보다 커야 합니다.";
  }

  /* ── 단위(unit) — 카테고리 정합성 ── */
  if (hasValidCategory) {
    const expectedUnit = CATEGORY_EXPECTED_UNIT[category as ActivityCategory];
    if (!unit) {
      errors.unit = "단위를 선택하세요.";
    } else if (unit !== expectedUnit) {
      const label = ActivityCategoryLabel[category as ActivityCategory];
      errors.unit = `${label} 활동의 단위는 ${expectedUnit} 여야 합니다.`;
    }
  }

  /* ── 설명(description) — 배출계수 매칭 ── */
  if (!description || description.trim() === "") {
    errors.description = "배출원(설명)을 입력하세요.";
  } else if (hasValidCategory) {
    const factor = findEmissionFactor(category as ActivityCategory, description);
    if (!factor) {
      errors.description = `'${description}'에 해당하는 배출계수를 찾을 수 없습니다.`;
    }
  }

  /* ── 일자(date) ── */
  if (!date) {
    errors.date = "일자를 입력하세요.";
  } else if (!isValidIsoDate(date)) {
    errors.date = "일자는 YYYY-MM-DD 형식이어야 합니다.";
  }

  return errors;
};

/**
 * 에러 맵에 오류가 하나라도 있는지 여부를 반환합니다.
 * 입력 폼의 제출 가능 여부 판단에 사용합니다.
 */
export const hasActivityInputErrors = (errors: ActivityInputErrors): boolean =>
  Object.keys(errors).length > 0;
