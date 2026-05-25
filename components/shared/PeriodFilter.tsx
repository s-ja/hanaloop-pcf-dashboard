"use client";

/**
 * PeriodFilter — 기간 선택 (월별/연간)
 *
 * 대시보드 상단에서 집계 기간을 전환합니다 (docs/USER_RESEARCH.md 4-1 기간 필터).
 * onChange 핸들러가 있어 인터랙션이 있으므로 클라이언트 컴포넌트입니다.
 *
 * 상태는 페이지 레벨로 끌어올림(Lift State Up) — 본 컴포넌트는 selected 를 받아
 * 표시만 하고 변경은 onChange 로 위임합니다.
 *
 * 표시 전용 — 도메인 로직 없음. 옵션 라벨은 lib/format 의 formatPeriodLabel 사용.
 */

import { formatPeriodLabel } from "@/lib/format";

interface PeriodFilterProps {
  selected: string;
  onChange: (period: string) => void;
  /**
   * 선택 가능한 기간 식별자 목록 ('YYYY' 또는 'YYYY-MM').
   * 미지정 시 2025년 연간 + 1~12월 기본 옵션을 사용합니다.
   */
  options?: readonly string[];
}

/** 기본 옵션 — 2025년 연간 + 1~12월 */
const DEFAULT_OPTIONS: readonly string[] = [
  "2025",
  ...Array.from(
    { length: 12 },
    (_, i) => `2025-${String(i + 1).padStart(2, "0")}`,
  ),
];

export default function PeriodFilter({
  selected,
  onChange,
  options = DEFAULT_OPTIONS,
}: PeriodFilterProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className="text-gray-500">기간</span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      >
        {options.map((period) => (
          <option key={period} value={period}>
            {formatPeriodLabel(period)}
          </option>
        ))}
      </select>
    </label>
  );
}
