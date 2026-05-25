/**
 * 표시 포매팅 순수 함수
 *
 * 화면에 값을 표시할 때 일관된 형식을 보장하기 위한 순수 함수 모음입니다.
 * 외부 npm 의존성이 없으며, 입력에만 의존하고 부수 효과가 없습니다.
 *
 * 설계 원칙 (docs/PLANNING.md 5-4, CLAUDE.md 코드 컨벤션):
 *   - 단위 표기는 kgCO₂e 로 통일 (types/index.ts 의 EMISSION_UNIT 사용)
 *   - 천 단위 구분자 적용 (docs/USER_RESEARCH.md 6장)
 *   - 컴포넌트는 계산/포매팅 로직을 직접 작성하지 않고 본 함수를 호출합니다.
 */

import { EMISSION_UNIT } from "@/types";

/** 천 단위 구분자 포맷의 기본 최대 소수 자릿수 (pcf-calculator 의 반올림과 동일) */
const DEFAULT_MAX_FRACTION_DIGITS = 3;

/**
 * 숫자를 천 단위 구분자가 포함된 문자열로 포맷합니다.
 *
 * @example formatNumber(2210.076) // "2,210.076"
 * @example formatNumber(12345)    // "12,345"
 *
 * @param value 포맷할 숫자
 * @param maxFractionDigits 최대 소수 자릿수 (기본 3)
 */
export const formatNumber = (
  value: number,
  maxFractionDigits: number = DEFAULT_MAX_FRACTION_DIGITS,
): string => {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
};

/**
 * 배출량을 값 + 단위(kgCO₂e) 결합 문자열로 포맷합니다.
 *
 * @example formatEmission(2210.076) // "2,210.076 kgCO₂e"
 *
 * @param value 배출량 (kgCO₂e)
 * @param maxFractionDigits 최대 소수 자릿수 (기본 3)
 */
export const formatEmission = (
  value: number,
  maxFractionDigits: number = DEFAULT_MAX_FRACTION_DIGITS,
): string => `${formatNumber(value, maxFractionDigits)} ${EMISSION_UNIT}`;

/**
 * 기간 식별자를 한국어 라벨로 포맷합니다.
 *
 * - 'YYYY-MM' → 'YYYY년 M월'  (예: '2025-05' → '2025년 5월')
 * - 'YYYY'    → 'YYYY년'       (예: '2025'    → '2025년')
 * - 그 외     → 입력값 그대로 반환
 *
 * @param period 기간 식별자
 */
export const formatPeriodLabel = (period: string): string => {
  const monthly = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthly) {
    const [, year, month] = monthly;
    return `${year}년 ${Number(month)}월`;
  }

  const yearly = /^(\d{4})$/.exec(period);
  if (yearly) {
    return `${yearly[1]}년`;
  }

  return period;
};

/**
 * 비율(fraction)을 퍼센트 문자열로 포맷합니다.
 *
 * @example formatPercent(0.08)         // "+8%"
 * @example formatPercent(-0.082, { fractionDigits: 1 }) // "-8.2%"
 * @example formatPercent(0, { signed: false })          // "0%"
 *
 * @param ratio 비율 값 (0.08 = 8%)
 * @param options.signed 양수에 '+' 부호 표시 여부 (기본 true)
 * @param options.fractionDigits 소수 자릿수 (기본 0)
 */
export const formatPercent = (
  ratio: number,
  options: { signed?: boolean; fractionDigits?: number } = {},
): string => {
  const { signed = true, fractionDigits = 0 } = options;
  if (!Number.isFinite(ratio)) return "—";

  const percent = ratio * 100;
  const rounded = Number(percent.toFixed(fractionDigits));
  const body = `${Math.abs(rounded).toFixed(fractionDigits)}%`;

  if (rounded < 0) return `-${body}`;
  if (rounded > 0 && signed) return `+${body}`;
  return body;
};

/**
 * 이전 값 대비 현재 값의 증감률을 퍼센트 문자열로 포맷합니다.
 * PCFSummaryCard 의 "전기간 대비 증감" 표시에 사용합니다.
 *
 * 이전 값이 0이면 증감률을 정의할 수 없으므로 '—' 를 반환합니다.
 *
 * @example formatPercentChange(108, 100) // "+8%"
 * @example formatPercentChange(92, 100)  // "-8%"
 *
 * @param current 현재 기간 값
 * @param previous 이전 기간 값
 * @param options formatPercent 와 동일한 옵션
 */
export const formatPercentChange = (
  current: number,
  previous: number,
  options: { signed?: boolean; fractionDigits?: number } = {},
): string => {
  if (previous === 0 || !Number.isFinite(previous)) return "—";
  return formatPercent((current - previous) / previous, options);
};
