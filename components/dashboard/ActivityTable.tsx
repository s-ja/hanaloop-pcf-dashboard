/**
 * ActivityTable — 개별 활동 데이터 목록 (드릴다운, 표시 전용)
 *
 * 실무자가 이상치의 원인을 개별 행 단위로 추적합니다 (docs/USER_RESEARCH.md
 * 시나리오 3). 동일 월 중복 행(예: 5월 전기 120+101)을 개별 행으로 모두 보여
 * 주고, 하단 합계 행으로 합산값도 함께 확인할 수 있게 합니다 (docs/DOMAIN.md 4장).
 *
 * Scope/단위/배출계수 출처는 Session 2 공유 컴포넌트(ScopeTag, UnitLabel,
 * EmissionFactorBadge)를 재사용합니다. 배출계수 조회는 lib/constants 의
 * findEmissionFactor, 행별 배출량은 lib/pcf-calculator 의 calculateActivityEmission
 * 를 사용합니다(컴포넌트 내부 계산 없음).
 *
 * 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import type { ActivityData } from "@/types";
import { ActivityCategoryLabel } from "@/types";
import { findEmissionFactor } from "@/lib/constants";
import { calculateActivityEmission } from "@/lib/pcf-calculator";
import { formatEmission, formatNumber, formatPeriodLabel } from "@/lib/format";
import ScopeTag from "@/components/shared/ScopeTag";
import UnitLabel from "@/components/shared/UnitLabel";
import EmissionFactorBadge from "@/components/shared/EmissionFactorBadge";

interface ActivityTableProps {
  activities: ActivityData[];
  period?: string;
}

export default function ActivityTable({ activities, period }: ActivityTableProps) {
  if (activities.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-fg-faint">
        {period ? `${formatPeriodLabel(period)}에 ` : ""}활동 데이터가 없습니다.
      </div>
    );
  }

  // 일자 → 카테고리 순 정렬 후 행별 배출량을 사전 계산 (렌더 중 변수 재할당 회피)
  const rows = [...activities]
    .sort((a, b) =>
      a.date === b.date
        ? a.category.localeCompare(b.category)
        : a.date.localeCompare(b.date),
    )
    .map((activity) => {
      const factor = findEmissionFactor(activity.category, activity.description);
      const emission = factor
        ? calculateActivityEmission(activity, factor)
        : 0;
      return { activity, factor, emission };
    });

  const total = rows.reduce((sum, row) => sum + row.emission, 0);

  return (
    <>
      {/* 데스크탑: 표 레이아웃 (md 이상) — D2: props 불변, 표시만 분기 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-fg-subtle">
              <th className="py-2 pr-3 font-medium">일자</th>
              <th className="py-2 pr-3 font-medium">카테고리</th>
              <th className="py-2 pr-3 font-medium">설명</th>
              <th className="py-2 pr-3 font-medium">Scope</th>
              <th className="py-2 pr-3 text-right font-medium">활동량</th>
              <th className="py-2 pr-3 font-medium">배출계수</th>
              <th className="py-2 pl-3 text-right font-medium">배출량</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ activity, factor, emission }) => {
              return (
                <tr
                  key={activity.id}
                  className="border-b border-border/60 text-fg-muted transition-colors hover:bg-surface-2"
                >
                  <td className="py-2 pr-3 whitespace-nowrap font-mono text-xs text-fg-subtle">
                    {activity.date}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-fg">
                    {ActivityCategoryLabel[activity.category]}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-fg">
                    {activity.description}
                  </td>
                  <td className="py-2 pr-3">
                    {factor ? <ScopeTag scope={factor.scope} /> : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    <span className="font-mono tabular-nums text-fg">
                      {formatNumber(activity.amount)}
                    </span>{" "}
                    <UnitLabel unit={activity.unit} />
                  </td>
                  <td className="py-2 pr-3">
                    {factor ? (
                      <EmissionFactorBadge
                        version={factor.version}
                        source={factor.source}
                        validFrom={factor.validFrom}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 pl-3 text-right whitespace-nowrap font-medium tabular-nums text-fg">
                    {formatEmission(emission)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong font-semibold text-fg">
              <td className="py-2 pr-3" colSpan={6}>
                합계 ({rows.length}건)
              </td>
              <td className="py-2 pl-3 text-right tabular-nums">
                {formatEmission(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 모바일: 카드형 레이아웃 (md 미만) — D2 권장안. 7열 가로 스크롤의 인지
          부담을 줄이기 위해 행을 카드로 전환합니다(동일 데이터, props 불변). */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map(({ activity, factor, emission }) => (
          <li
            key={activity.id}
            className="rounded-[var(--radius-control)] border border-border bg-surface-2/40 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] text-fg-subtle">
                  {activity.date}
                </span>
                <span className="text-sm font-medium text-fg">
                  {ActivityCategoryLabel[activity.category]} · {activity.description}
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold tabular-nums text-fg">
                  {formatEmission(emission)}
                </div>
                <div className="font-mono text-[11px] text-fg-muted">
                  {formatNumber(activity.amount)} {activity.unit}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {factor && <ScopeTag scope={factor.scope} />}
              {factor && (
                <EmissionFactorBadge
                  version={factor.version}
                  source={factor.source}
                  validFrom={factor.validFrom}
                />
              )}
            </div>
          </li>
        ))}
        <li className="mt-1 flex items-center justify-between border-t-2 border-border-strong px-1 pt-2 text-sm font-semibold text-fg">
          <span>합계 ({rows.length}건)</span>
          <span className="font-mono tabular-nums">{formatEmission(total)}</span>
        </li>
      </ul>
    </>
  );
}
