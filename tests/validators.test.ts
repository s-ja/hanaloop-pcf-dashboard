/**
 * lib/validators.ts 단위 테스트
 */

import { describe, expect, it } from "vitest";

import {
  hasActivityInputErrors,
  validateActivityInput,
} from "@/lib/validators";

describe("validateActivityInput", () => {
  it("정상 입력은 오류가 없다", () => {
    const errors = validateActivityInput({
      productId: "CT-045",
      category: "electricity",
      description: "한국전력",
      date: "2025-05-01",
      amount: 120,
      unit: "kWh",
      emissionFactorId: "EF_ELECTRICITY_KEPCO_2025",
    });
    expect(errors).toEqual({});
    expect(hasActivityInputErrors(errors)).toBe(false);
  });

  it("활동량이 0 이하면 오류", () => {
    expect(validateActivityInput({ amount: 0 }).amount).toBeDefined();
    expect(validateActivityInput({ amount: -5 }).amount).toBeDefined();
  });

  it("활동량이 비어 있으면 오류", () => {
    expect(validateActivityInput({}).amount).toBeDefined();
    expect(validateActivityInput({ amount: Number.NaN }).amount).toBeDefined();
  });

  it("카테고리-단위가 불일치하면 단위 오류", () => {
    const errors = validateActivityInput({
      category: "electricity",
      unit: "kg",
    });
    expect(errors.unit).toContain("kWh");
  });

  it("카테고리별 기대 단위를 검사한다", () => {
    expect(
      validateActivityInput({ category: "material", unit: "kg" }).unit,
    ).toBeUndefined();
    expect(
      validateActivityInput({ category: "transport", unit: "ton-km" }).unit,
    ).toBeUndefined();
  });

  it("알 수 없는 배출원은 설명 오류", () => {
    const errors = validateActivityInput({
      category: "electricity",
      description: "알 수 없는 발전소",
    });
    expect(errors.description).toBeDefined();
  });

  it("알려진 배출원은 설명 오류가 없다", () => {
    expect(
      validateActivityInput({ category: "material", description: "플라스틱 1" })
        .description,
    ).toBeUndefined();
  });

  it("잘못된 날짜 형식은 오류", () => {
    expect(validateActivityInput({ date: "2025-13-40" }).date).toBeDefined();
    expect(validateActivityInput({ date: "2025-02-30" }).date).toBeDefined();
    expect(validateActivityInput({ date: "25-5-1" }).date).toBeDefined();
  });

  it("유효한 날짜는 오류가 없다", () => {
    expect(validateActivityInput({ date: "2025-05-01" }).date).toBeUndefined();
  });

  it("hasActivityInputErrors 는 오류 유무를 반영한다", () => {
    expect(hasActivityInputErrors({})).toBe(false);
    expect(hasActivityInputErrors({ amount: "오류" })).toBe(true);
  });
});
