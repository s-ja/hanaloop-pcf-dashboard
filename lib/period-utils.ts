/**
 * 기간(period) 보조 순수 함수
 *
 * 대시보드의 "이전 기간 대비 증감"과 기간 필터 옵션 구성에 사용하는 순수 함수
 * 모음입니다. 계산 로직(lib/pcf-calculator.ts)과 분리된 표시/탐색 보조 유틸이며,
 * 외부 의존성이 없어 vitest 로 직접 검증합니다 (Session 3 검증 권장 항목).
 *
 * 기간 식별자 형식:
 *   - 'YYYY-MM' (월별)
 *   - 'YYYY'    (연간)
 */

import type { PCFTrendPoint } from "@/types";

/**
 * 주어진 기간의 직전 기간 식별자를 반환합니다.
 *
 * - 'YYYY-MM' → 직전 월 (1월이면 전년 12월로 넘어감)
 * - 'YYYY'    → 직전 연도
 * - 그 외     → 입력값 그대로 반환
 *
 * 과제 데이터는 2025-01 ~ 2025-08 범위이므로, 2025-01 의 직전(2024-12)이나
 * 연간 2025 의 직전(2024)은 데이터가 없어 PCF 0 으로 집계됩니다. 이 경우
 * formatPercentChange 가 '—' 를 반환하여 빈 비교를 자연스럽게 처리합니다.
 *
 * @example getPreviousPeriod('2025-05') // '2025-04'
 * @example getPreviousPeriod('2025-01') // '2024-12'
 * @example getPreviousPeriod('2025')    // '2024'
 */
export const getPreviousPeriod = (period: string): string => {
  const monthly = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthly) {
    let year = Number(monthly[1]);
    let month = Number(monthly[2]) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  const yearly = /^(\d{4})$/.exec(period);
  if (yearly) {
    return String(Number(yearly[1]) - 1);
  }

  return period;
};

/** 기간이 연간('YYYY') 식별자인지 판별합니다. */
export const isYearlyPeriod = (period: string): boolean =>
  /^\d{4}$/.test(period);

/** 기간 식별자에서 연도(YYYY)를 추출합니다. */
export const getYearOfPeriod = (period: string): string => period.slice(0, 4);

/**
 * 트렌드 데이터에 실제로 존재하는 기간만으로 PeriodFilter 옵션을 구성합니다.
 *
 * 결과: [연간, ...데이터에 등장하는 월(오름차순)]
 * 데이터가 비어 있으면 빈 배열을 반환합니다.
 *
 * @example
 *   buildDashboardPeriodOptions([{ period: '2025-01', ... }, { period: '2025-02', ... }])
 *   // ['2025', '2025-01', '2025-02']
 */
export const buildDashboardPeriodOptions = (
  trend: readonly PCFTrendPoint[],
): string[] => {
  if (trend.length === 0) return [];
  const year = getYearOfPeriod(trend[0].period);
  const months = trend.map((point) => point.period);
  return [year, ...months];
};
