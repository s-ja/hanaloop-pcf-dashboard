"use client";

/**
 * ActivityInputForm — 활동 데이터 입력 폼
 *
 * 실무자(김환경 주임)가 전기/원소재/운송 활동을 입력합니다
 * (docs/USER_RESEARCH.md 시나리오 1). 핵심 UX:
 *   - 카테고리 선택 시 단위 자동 고정·표시(UnitLabel) → 단위 오선택 차단
 *   - 카테고리별 배출원(설명) 옵션은 EMISSION_FACTORS 에서 파생(하드코딩 없음)
 *   - 선택한 배출계수의 출처·버전·Scope 를 EmissionFactorBadge/ScopeTag 로 노출
 *   - 잘못된 입력은 즉시 필드별 에러 메시지(체크리스트 필수)
 *
 * 검증은 lib/validators 의 validateActivityInput 만 호출합니다(컴포넌트에 검증
 * 규칙 중복 작성 금지 — CLAUDE.md 불변 제약). 옵션·단위 도출과 입력값 조립은
 * lib/input-helpers 의 순수 함수에 위임합니다.
 *
 * 상태는 입력값만 보유하고, 제출 후 처리(목록 추가·프리뷰)는 페이지가 담당합니다
 * (Lift State Up). PLANNING 5-2 시그니처 유지: { emissionFactors, onSubmit }.
 */

import { useMemo, useState } from "react";

import type {
  ActivityCategory,
  ActivityDataInput,
  EmissionFactor,
} from "@/types";
import { ActivityCategoryLabel } from "@/types";
import { DEFAULT_PRODUCT_ID } from "@/lib/constants";
import {
  hasActivityInputErrors,
  validateActivityInput,
} from "@/lib/validators";
import {
  getInputCategories,
  getSourceOptions,
  getUnitForCategory,
} from "@/lib/input-helpers";

import ScopeTag from "@/components/shared/ScopeTag";
import UnitLabel from "@/components/shared/UnitLabel";
import EmissionFactorBadge from "@/components/shared/EmissionFactorBadge";
import Button from "@/components/ui/Button";
import ActivityFormField from "@/components/input/ActivityFormField";

interface ActivityInputFormProps {
  emissionFactors: readonly EmissionFactor[];
  onSubmit: (data: ActivityDataInput) => void;
}

/** 오류 시 빨강 테두리를 더하는 공통 입력 스타일 */
const controlClass = (hasError: boolean): string =>
  `rounded-md border px-3 py-2 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-50 disabled:text-gray-400 ${
    hasError ? "border-red-400" : "border-gray-300"
  }`;

type FieldKey = "category" | "description" | "date" | "amount";

export default function ActivityInputForm({
  emissionFactors,
  onSubmit,
}: ActivityInputFormProps) {
  const [category, setCategory] = useState<ActivityCategory | "">("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    category: false,
    description: false,
    date: false,
    amount: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const categories = useMemo(
    () => getInputCategories(emissionFactors),
    [emissionFactors],
  );

  // 카테고리에서 파생되는 단위·배출원 옵션 (하드코딩 없음)
  const unit = category
    ? getUnitForCategory(emissionFactors, category)
    : undefined;
  const sourceOptions = useMemo(
    () => (category ? getSourceOptions(emissionFactors, category) : []),
    [emissionFactors, category],
  );

  // 선택한 (카테고리, 배출원)의 배출계수 — 배지/제출 시 id 해석에 사용
  const selectedFactor = useMemo(
    () =>
      category && description
        ? emissionFactors.find(
            (f) => f.category === category && f.source === description,
          )
        : undefined,
    [emissionFactors, category, description],
  );

  const draft: Partial<ActivityDataInput> = {
    category: category || undefined,
    description: description || undefined,
    date: date || undefined,
    amount: amount === "" ? undefined : Number(amount),
    unit,
  };
  const errors = validateActivityInput(draft);

  // 해당 필드를 건드렸거나 제출을 시도한 경우에만 에러를 노출합니다.
  const errorFor = (field: FieldKey): string | undefined =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const markTouched = (field: FieldKey) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleCategoryChange = (next: ActivityCategory | "") => {
    setCategory(next);
    // 카테고리가 바뀌면 배출원 옵션이 달라지므로 선택을 초기화합니다.
    setDescription("");
    setTouched((prev) => ({ ...prev, category: true, description: false }));
  };

  const resetForm = () => {
    setCategory("");
    setDescription("");
    setDate("");
    setAmount("");
    setTouched({
      category: false,
      description: false,
      date: false,
      amount: false,
    });
    setSubmitAttempted(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (hasActivityInputErrors(errors) || !selectedFactor || !unit) return;

    onSubmit({
      productId: DEFAULT_PRODUCT_ID,
      category: category as ActivityCategory,
      description,
      date,
      amount: Number(amount),
      unit,
      emissionFactorId: selectedFactor.id,
    });
    resetForm();
  };

  const submitDisabled = hasActivityInputErrors(errors);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* 카테고리 → 단위 자동 결정 */}
      <ActivityFormField label="활동 카테고리" error={errorFor("category")}>
        <select
          value={category}
          onChange={(e) =>
            handleCategoryChange(e.target.value as ActivityCategory | "")
          }
          onBlur={() => markTouched("category")}
          className={controlClass(Boolean(errorFor("category")))}
        >
          <option value="">선택하세요</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {ActivityCategoryLabel[c]}
            </option>
          ))}
        </select>
      </ActivityFormField>

      {/* 단위 — 카테고리에서 자동 표시(고정, 편집 불가) */}
      <ActivityFormField label="단위 (자동)">
        <div className="flex h-[42px] items-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
          {unit ? (
            <UnitLabel unit={unit} />
          ) : (
            <span className="text-xs text-gray-400">
              카테고리를 선택하면 단위가 자동 표시됩니다.
            </span>
          )}
        </div>
      </ActivityFormField>

      {/* 배출원(설명) — 카테고리별 옵션 */}
      <ActivityFormField label="배출원 (설명)" error={errorFor("description")}>
        <select
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => markTouched("description")}
          disabled={!category}
          className={controlClass(Boolean(errorFor("description")))}
        >
          <option value="">
            {category ? "선택하세요" : "먼저 카테고리를 선택하세요"}
          </option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </ActivityFormField>

      {/* 선택한 배출계수 출처/버전/Scope 노출 */}
      {selectedFactor && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-sky-50 px-3 py-2">
          <span className="text-xs text-gray-500">적용 배출계수</span>
          <EmissionFactorBadge
            version={selectedFactor.version}
            source={selectedFactor.source}
            validFrom={selectedFactor.validFrom}
          />
          <ScopeTag scope={selectedFactor.scope} />
        </div>
      )}

      {/* 일자 */}
      <ActivityFormField label="일자" error={errorFor("date")}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => markTouched("date")}
          className={controlClass(Boolean(errorFor("date")))}
        />
      </ActivityFormField>

      {/* 활동량 — 단위는 라벨에 함께 표기(카테고리에서 자동 도출) */}
      <ActivityFormField
        label={unit ? `활동량 (${unit})` : "활동량"}
        error={errorFor("amount")}
      >
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => markTouched("amount")}
          placeholder="예: 125"
          className={controlClass(Boolean(errorFor("amount")))}
        />
      </ActivityFormField>

      <div className="pt-1">
        <Button type="submit" disabled={submitDisabled}>
          활동 추가
        </Button>
      </div>
    </form>
  );
}
