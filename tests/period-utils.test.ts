/**
 * lib/period-utils.ts 단위 테스트
 *
 * 대시보드 증감 비교 / 기간 필터 옵션 구성의 보조 함수 검증
 * (Session 3 검증 권장 항목 — 계산 경계 보조 함수 단위 테스트).
 */

import { describe, expect, it } from "vitest";

import type { PCFTrendPoint } from "@/types";
import {
  buildDashboardPeriodOptions,
  getPreviousPeriod,
  getYearOfPeriod,
  isYearlyPeriod,
} from "@/lib/period-utils";

describe("getPreviousPeriod", () => {
  it("월별 기간의 직전 월을 반환한다", () => {
    expect(getPreviousPeriod("2025-05")).toBe("2025-04");
    expect(getPreviousPeriod("2025-12")).toBe("2025-11");
  });

  it("1월이면 전년 12월로 넘어간다", () => {
    expect(getPreviousPeriod("2025-01")).toBe("2024-12");
  });

  it("연간 기간의 직전 연도를 반환한다", () => {
    expect(getPreviousPeriod("2025")).toBe("2024");
  });

  it("형식에 맞지 않으면 입력값을 그대로 반환한다", () => {
    expect(getPreviousPeriod("invalid")).toBe("invalid");
  });
});

describe("isYearlyPeriod", () => {
  it("연간/월별을 구분한다", () => {
    expect(isYearlyPeriod("2025")).toBe(true);
    expect(isYearlyPeriod("2025-05")).toBe(false);
  });
});

describe("getYearOfPeriod", () => {
  it("기간에서 연도를 추출한다", () => {
    expect(getYearOfPeriod("2025-05")).toBe("2025");
    expect(getYearOfPeriod("2025")).toBe("2025");
  });
});

describe("buildDashboardPeriodOptions", () => {
  const trend = (periods: string[]): PCFTrendPoint[] =>
    periods.map((period) => ({
      period,
      totalPCF: 0,
      breakdown: { electricity: 0, material: 0, transport: 0 },
    }));

  it("연간 + 데이터에 존재하는 월(오름차순)로 구성한다", () => {
    expect(
      buildDashboardPeriodOptions(trend(["2025-01", "2025-02", "2025-08"])),
    ).toEqual(["2025", "2025-01", "2025-02", "2025-08"]);
  });

  it("데이터가 없으면 빈 배열을 반환한다", () => {
    expect(buildDashboardPeriodOptions([])).toEqual([]);
  });
});
