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
    ? "text-red-600 bg-red-50"
    : decreased
      ? "text-emerald-600 bg-emerald-50"
      : "text-gray-500 bg-gray-100";
  const arrow = increased ? "↑" : decreased ? "↓" : "";

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-gray-500">
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
          <span>{changeText}</span>
          <span className="sr-only">직전 기간 대비</span>
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-gray-900">
          {formatNumber(totalPCF)}
        </span>
        <span className="text-lg font-medium text-gray-500">{unit}</span>
      </p>
    </section>
  );
}
