/**
 * lib/input-helpers.ts 단위 테스트
 *
 * 입력 폼 옵션 도출이 EMISSION_FACTORS 에서 올바르게 파생되는지(하드코딩 없음),
 * 그리고 입력값 → ActivityData 변환이 정확한지 검증합니다.
 */

import { describe, expect, it } from "vitest";

import { EMISSION_FACTORS } from "@/lib/constants";
import {
  getInputCategories,
  getSourceOptions,
  getUnitForCategory,
  toActivityData,
} from "@/lib/input-helpers";
import type { ActivityDataInput } from "@/types";

describe("getInputCategories", () => {
  it("배출계수 마스터의 카테고리를 중복 없이 도출한다", () => {
    expect(getInputCategories(EMISSION_FACTORS)).toEqual([
      "electricity",
      "material",
      "transport",
    ]);
  });
});

describe("getSourceOptions", () => {
  it("electricity → 한국전력", () => {
    expect(getSourceOptions(EMISSION_FACTORS, "electricity")).toEqual([
      "한국전력",
    ]);
  });

  it("material → 플라스틱 1, 플라스틱 2 (중복 제거)", () => {
    expect(getSourceOptions(EMISSION_FACTORS, "material")).toEqual([
      "플라스틱 1",
      "플라스틱 2",
    ]);
  });

  it("transport → 트럭", () => {
    expect(getSourceOptions(EMISSION_FACTORS, "transport")).toEqual(["트럭"]);
  });
});

describe("getUnitForCategory", () => {
  it("배출계수 단위에서 활동 단위를 파생한다 (하드코딩 없음)", () => {
    expect(getUnitForCategory(EMISSION_FACTORS, "electricity")).toBe("kWh");
    expect(getUnitForCategory(EMISSION_FACTORS, "material")).toBe("kg");
    expect(getUnitForCategory(EMISSION_FACTORS, "transport")).toBe("ton-km");
  });
});

describe("toActivityData", () => {
  it("입력값에 id/createdAt 을 합쳐 ActivityData 를 만든다", () => {
    const input: ActivityDataInput = {
      productId: "CT-045",
      category: "electricity",
      description: "한국전력",
      date: "2025-09-01",
      amount: 125,
      unit: "kWh",
      emissionFactorId: "EF_ELECTRICITY_KEPCO_2025",
    };
    const result = toActivityData(input, "uuid-1", "2026-05-25T00:00:00.000Z");

    expect(result).toEqual({
      ...input,
      id: "uuid-1",
      createdAt: "2026-05-25T00:00:00.000Z",
    });
  });
});
