/**
 * ScopeTag — GHG Scope 라벨 배지 (표시 전용)
 *
 * Scope 별 색상 + 기호를 함께 표기하여 색맹 접근성을 확보합니다
 * (docs/USER_RESEARCH.md 6장: 색상만으로 신호하지 않고 아이콘/기호 병행).
 * 의미 설명은 native title 툴팁으로 제공합니다.
 *
 * 표시 전용 — 도메인 로직 없음. EmissionScopeLabel 로 라벨만 렌더합니다.
 * 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import type { EmissionScope } from "@/types";
import { EmissionScopeLabel } from "@/types";

interface ScopeTagProps {
  scope: EmissionScope;
}

/** Scope 별 시각 구성 — 색상 클래스 + 기호 + 툴팁 설명 */
const SCOPE_CONFIG: Record<
  EmissionScope,
  { className: string; symbol: string; title: string }
> = {
  scope1: {
    className: "bg-amber-100 text-amber-800 ring-amber-600/20",
    symbol: "S1",
    title: "Scope 1 — 기업이 직접 통제하는 배출원 (연소 등 직접 배출)",
  },
  scope2: {
    className: "bg-sky-100 text-sky-800 ring-sky-600/20",
    symbol: "S2",
    title: "Scope 2 — 구매한 전기·열·증기에서 발생하는 간접 배출",
  },
  scope3_upstream: {
    className: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    symbol: "S3↑",
    title: "Scope 3 (업스트림) — 원자재·협력사 운송 등 가치사슬 상류 간접 배출",
  },
  scope3_downstream: {
    className: "bg-violet-100 text-violet-800 ring-violet-600/20",
    symbol: "S3↓",
    title: "Scope 3 (다운스트림) — 제품 배송·사용·폐기 등 가치사슬 하류 간접 배출",
  },
};

export default function ScopeTag({ scope }: ScopeTagProps) {
  const { className, symbol, title } = SCOPE_CONFIG[scope];

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden className="font-semibold">
        {symbol}
      </span>
      <span>{EmissionScopeLabel[scope]}</span>
    </span>
  );
}
