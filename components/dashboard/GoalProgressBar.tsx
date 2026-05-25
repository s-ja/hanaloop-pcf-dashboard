/**
 * GoalProgressBar — 연간 목표 대비 진척도 게이지 (표시 전용)
 *
 * 경영자가 "목표 달성까지 얼마나 남았는가"를 한 줄로 파악합니다
 * (docs/USER_RESEARCH.md 시나리오 2, 4-1 목표 대비 진척도).
 *
 * 과제 데이터의 제품(CT-045)에는 targetPCF 가 없습니다(미설정). 따라서:
 *   - target 이 없거나 0 이하이면 빈 상태(목표 미설정)로 처리합니다.
 *   - 데모 목표는 호출부에서 lib/dashboard-config 의 값을 주입합니다.
 *
 * 탄소 배출 맥락에서 목표는 "상한 예산"이므로 초과(>100%)가 경고(빨강)입니다.
 * 색상 + 텍스트를 함께 제공하여 색맹 접근성을 확보합니다.
 *
 * 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import { formatEmission, formatPercent } from "@/lib/format";

interface GoalProgressBarProps {
  current: number;
  /** 목표 PCF (kgCO₂e). 미설정이면 undefined */
  target?: number;
  unit: string;
}

export default function GoalProgressBar({
  current,
  target,
  unit,
}: GoalProgressBarProps) {
  // 목표 미설정 — 빈 상태 처리
  if (!target || target <= 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        목표 PCF가 설정되지 않았습니다. 목표를 설정하면 진척도를 확인할 수 있습니다.
      </div>
    );
  }

  const ratio = current / target;
  const barWidth = Math.min(ratio, 1) * 100;
  const exceeded = ratio > 1;
  const nearLimit = ratio >= 0.75 && ratio <= 1;

  const barColor = exceeded
    ? "bg-red-500"
    : nearLimit
      ? "bg-amber-500"
      : "bg-emerald-500";
  const statusText = exceeded
    ? "목표 초과"
    : nearLimit
      ? "목표 임박"
      : "목표 이내";
  const statusClass = exceeded
    ? "text-red-600"
    : nearLimit
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-gray-700">
          연간 누적 <span className="font-semibold">{formatEmission(current)}</span>
          <span className="text-gray-400"> / 목표 {formatEmission(target)}</span>
        </span>
        <span className={`font-semibold ${statusClass}`}>
          {formatPercent(ratio, { signed: false })} · {statusText}
        </span>
      </div>

      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`연간 목표 대비 진척도, 목표 단위 ${unit}`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
