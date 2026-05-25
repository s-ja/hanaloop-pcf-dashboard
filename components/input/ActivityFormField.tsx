"use client";

/**
 * ActivityFormField — 단일 입력 필드 래퍼 (표시 전용)
 *
 * label + 컨트롤(input/select) + 에러 메시지를 한 단위로 렌더합니다.
 * 검증 규칙은 포함하지 않으며, 부모 폼이 전달한 error 문자열만 표시합니다
 * (체크리스트 필수: 오류 입력 시 에러 메시지 표시 — docs/USER_RESEARCH.md 4-2).
 *
 * 접근성(docs/USER_RESEARCH.md 6장):
 *   - 에러는 색상(빨강)만이 아니라 텍스트로도 전달하여 색맹 접근성을 확보합니다.
 *   - label↔컨트롤을 htmlFor/id 로 연결하고, 오류 시 컨트롤에 aria-invalid 와
 *     aria-describedby 를 자동 연결합니다. id 는 useId 로 생성하여 폼이 별도
 *     id 를 관리하지 않아도 됩니다(단일 자식 컨트롤을 cloneElement 로 보강).
 *
 * PLANNING 5-2 시그니처 유지: { label, error?, children }.
 * 부모 폼이 'use client' 이므로 함께 클라이언트 컴포넌트로 둡니다(useId 사용).
 */

import { cloneElement, isValidElement, useId } from "react";
import type { ReactNode } from "react";

interface ActivityFormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function ActivityFormField({
  label,
  error,
  children,
}: ActivityFormFieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  // 단일 자식 컨트롤에 id 와 접근성 속성을 주입합니다. 컨트롤이 아닌 경우
  // (예외적 사용)에는 보강 없이 그대로 렌더합니다.
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: fieldId,
        "aria-invalid": hasError || undefined,
        "aria-describedby": hasError ? errorId : undefined,
      } as Record<string, unknown>)
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {control}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-red-600"
        >
          <span aria-hidden>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
