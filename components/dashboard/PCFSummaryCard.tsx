/**
 * PCFSummaryCard — 총 PCF + 전기간 대비 증감 (표시 전용)
 *
 * 경영자(이탄소 이사)가 대시보드 진입 즉시 인지해야 할 핵심 수치입니다
 * (docs/USER_RESEARCH.md 시나리오 2, 4-1 최상단 우선순위).
 *
 * 증감은 색상 + 아이콘(↑/↓)을 함께 표기하여 색맹 접근성을 확보합니다
 * (docs/USER_RESEARCH.md 6장). 탄소 배출 맥락에서 증가=빨강, 감소=초록.
 * 이전 기간 데이터가 없으면(previousPCF=0) 증감은 '—' 로 표시합니다.
 *
 * 수치/단위는 lib/format 을 거쳐 표시합니다(하드코딩 없음).
 * 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import { formatNumber, formatPeriodLabel, formatPercentChange } from "@/lib/format";

interface PCFSummaryCardProps {
  totalPCF: number;
  previousPCF: number;
  unit: string;
  period: string;
}

export default function PCFSummaryCard({
  totalPCF,
  previousPCF,
  unit,
  period,
}: PCFSummaryCardProps) {
  const changeText = formatPercentChange(totalPCF, previousPCF);
  const hasComparison = changeText !== "—";
  const increased = hasComparison && totalPCF > previousPCF;
  const decreased = hasComparison && totalPCF < previousPCF;

  // 증가=빨강(악화), 감소=초록(개선), 비교 불가/동일=회색
  const changeClass = increased
    ? "text-[color:var(--color-up)] bg-[color:var(--color-up-soft)]"
    : decreased
      ? "text-[color:var(--color-down)] bg-[color:var(--color-down-soft)]"
      : "text-fg-subtle bg-surface-2";
  const arrow = increased ? "↑" : decreased ? "↓" : "";

  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-fg-subtle">
          {formatPeriodLabel(period)} 총 PCF
        </h2>
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold ${changeClass}`}
          title={
            hasComparison
              ? "직전 기간 대비 증감률"
              : "직전 기간 데이터가 없어 비교할 수 없습니다"
          }
        >
          {arrow && <span aria-hidden>{arrow}</span>}
          <span className="font-mono">{changeText}</span>
          <span className="sr-only">직전 기간 대비</span>
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold tracking-tight text-fg">
          {formatNumber(totalPCF)}
        </span>
        <span className="font-mono text-base text-fg-subtle">{unit}</span>
      </p>
    </section>
  );
}
