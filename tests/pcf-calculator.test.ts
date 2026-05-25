/**
 * pcf-calculator 회귀 테스트
 *
 * 기준값 출처: docs/DOMAIN.md 2-1 — 2025년 5월(CT-045) 검증 예시.
 * 이 테스트가 통과해야 Session 1 완료 조건(5월 PCF 값 정확 일치)이 충족됩니다.
 *
 * 검증 항목:
 *   1) 5월 카테고리별 / 합계 PCF 값이 도메인 문서 기준값과 정확히 일치
 *   2) 동일 월 중복 행(전기·플라스틱1·트럭)이 합산 처리됨
 */

import { describe, expect, it } from "vitest";

import { EMISSION_FACTORS, DEFAULT_PRODUCT_ID } from "@/lib/constants";
import { MOCK_ACTIVITY_DATA } from "@/lib/mock-data";
import {
  buildMonthlyTrend,
  calculatePCF,
  calculatePCFForPeriod,
} from "@/lib/pcf-calculator";

describe("calculatePCFForPeriod — 2025년 5월 검증값 (docs/DOMAIN.md 2-1)", () => {
  const result = calculatePCFForPeriod(
    MOCK_ACTIVITY_DATA,
    EMISSION_FACTORS,
    DEFAULT_PRODUCT_ID,
    "2025-05",
  );

  it("전기: (120 + 101) kWh × 0.456 = 100.776 kgCO₂e", () => {
    expect(result.breakdown.electricity).toBe(100.776);
  });

  it("원소재: (424 + 232) kg × 2.3 + 40 kg × 3.2 = 1636.8 kgCO₂e", () => {
    expect(result.breakdown.material).toBe(1636.8);
  });

  it("운송: (123 + 12) ton-km × 3.5 = 472.5 kgCO₂e", () => {
    expect(result.breakdown.transport).toBe(472.5);
  });

  it("합계: 2210.076 kgCO₂e", () => {
    expect(result.totalPCF).toBe(2210.076);
  });

  it("5월 활동 데이터는 중복 행 포함 7건", () => {
    // 전기 2 + 원소재 3(플라스틱1 ×2, 플라스틱2 ×1) + 운송 2 = 7
    expect(result.activityCount).toBe(7);
  });

  it("사용된 배출계수 버전이 추적된다", () => {
    expect(result.emissionFactorVersions).toContain("KEPCO-2025");
    expect(result.emissionFactorVersions).toContain("DEFAULT-2025");
  });
});

describe("동일 월 중복 데이터 합산 처리 (docs/DOMAIN.md 4장)", () => {
  it("전기 중복 행(120, 101)이 합산되어 221 kWh 기준으로 계산된다", () => {
    const mayElectricity = MOCK_ACTIVITY_DATA.filter(
      (a) =>
        a.category === "electricity" && a.date.startsWith("2025-05"),
    );
    expect(mayElectricity).toHaveLength(2);

    const result = calculatePCF(mayElectricity, EMISSION_FACTORS, {
      period: "2025-05",
    });
    // (120 + 101) × 0.456 = 100.776
    expect(result.breakdown.electricity).toBe(100.776);
  });
});

describe("buildMonthlyTrend", () => {
  const trend = buildMonthlyTrend(
    MOCK_ACTIVITY_DATA,
    EMISSION_FACTORS,
    DEFAULT_PRODUCT_ID,
  );

  it("1월~8월 8개 기간이 오름차순으로 생성된다", () => {
    expect(trend.map((p) => p.period)).toEqual([
      "2025-01",
      "2025-02",
      "2025-03",
      "2025-04",
      "2025-05",
      "2025-06",
      "2025-07",
      "2025-08",
    ]);
  });

  it("5월 트렌드 포인트의 합계가 2210.076 과 일치한다", () => {
    const may = trend.find((p) => p.period === "2025-05");
    expect(may?.totalPCF).toBe(2210.076);
  });
});
