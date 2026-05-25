/**
 * lib/format.ts 단위 테스트
 */

import { describe, expect, it } from "vitest";

import {
  formatEmission,
  formatNumber,
  formatPercent,
  formatPercentChange,
  formatPeriodLabel,
} from "@/lib/format";

describe("formatNumber", () => {
  it("천 단위 구분자를 적용한다", () => {
    expect(formatNumber(2210.076)).toBe("2,210.076");
    expect(formatNumber(12345)).toBe("12,345");
    expect(formatNumber(0)).toBe("0");
  });

  it("소수 자릿수를 제한할 수 있다", () => {
    expect(formatNumber(2210.0769, 2)).toBe("2,210.08");
  });

  it("유한하지 않은 값은 '—' 로 표시한다", () => {
    expect(formatNumber(Number.NaN)).toBe("—");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatEmission", () => {
  it("값과 kgCO₂e 단위를 결합한다", () => {
    expect(formatEmission(2210.076)).toBe("2,210.076 kgCO₂e");
  });
});

describe("formatPeriodLabel", () => {
  it("월별 식별자를 'YYYY년 M월' 로 변환한다", () => {
    expect(formatPeriodLabel("2025-05")).toBe("2025년 5월");
    expect(formatPeriodLabel("2025-12")).toBe("2025년 12월");
  });

  it("연간 식별자를 'YYYY년' 으로 변환한다", () => {
    expect(formatPeriodLabel("2025")).toBe("2025년");
  });

  it("알 수 없는 형식은 그대로 반환한다", () => {
    expect(formatPeriodLabel("전체")).toBe("전체");
  });
});

describe("formatPercent", () => {
  it("양수에는 '+' 부호를 붙인다", () => {
    expect(formatPercent(0.08)).toBe("+8%");
  });

  it("음수는 '-' 부호로 표시한다", () => {
    expect(formatPercent(-0.082, { fractionDigits: 1 })).toBe("-8.2%");
  });

  it("signed=false 이면 양수 부호를 생략한다", () => {
    expect(formatPercent(0.08, { signed: false })).toBe("8%");
  });

  it("0은 부호 없이 표시한다", () => {
    expect(formatPercent(0)).toBe("0%");
  });
});

describe("formatPercentChange", () => {
  it("이전 값 대비 증감률을 계산해 포맷한다", () => {
    expect(formatPercentChange(108, 100)).toBe("+8%");
    expect(formatPercentChange(92, 100)).toBe("-8%");
  });

  it("이전 값이 0이면 '—' 를 반환한다", () => {
    expect(formatPercentChange(50, 0)).toBe("—");
  });
});
