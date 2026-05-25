"use client";

/**
 * /input — 활동 데이터 입력 (실무자 중심)
 *
 * 조립 + 상태 보유 페이지입니다 (docs/USER_RESEARCH.md 시나리오 1).
 * 김환경 주임이 활동을 입력하면 페이지 우측에 즉시 PCF 프리뷰가 갱신됩니다.
 *
 * 상태(Lift State Up):
 *   - addedActivities: 이번 세션에 입력한 활동분(ActivityData[]). id/createdAt 은
 *     제출 시 클라이언트가 생성합니다(crypto.randomUUID() + ISO now).
 *
 * Phase 1 영속성 범위 (docs/PLANNING.md 2-1, 4-3):
 *   - API/DB/전역 스토어가 없으므로 입력분은 "기존 mock + 이번 입력분"을 합쳐
 *     본 페이지 안에서만 프리뷰합니다. mock-data 는 절대 변형하지 않습니다.
 *   - 새로고침 시 입력분이 사라지는 것은 정상이며, /dashboard 와의 동기화 및
 *     영속화는 Phase 2(api-client/POST) 과제입니다.
 *
 * 계산은 lib/pcf-calculator(usePCFCalculation 위임), 검증은 lib/validators(폼 내부),
 * 표시 포매팅은 lib/format, 배출계수는 EMISSION_FACTORS(SSOT)를 사용합니다.
 */

import { useMemo, useState } from "react";

import type { ActivityData, ActivityDataInput } from "@/types";
import { ActivityCategoryLabel, EMISSION_UNIT } from "@/types";
import {
  DEFAULT_PRODUCT_ID,
  EMISSION_FACTORS,
  findEmissionFactor,
} from "@/lib/constants";
import {
  calculateActivityEmission,
  filterActivities,
  getMonthlyPeriodKey,
} from "@/lib/pcf-calculator";
import { toActivityData } from "@/lib/input-helpers";
import { usePCFData } from "@/hooks/usePCFData";
import { usePCFCalculation } from "@/hooks/usePCFCalculation";
import { formatEmission, formatNumber, formatPeriodLabel } from "@/lib/format";

import Card from "@/components/ui/Card";
import PCFSummaryCard from "@/components/dashboard/PCFSummaryCard";
import EmissionBreakdownChart from "@/components/dashboard/EmissionBreakdownChart";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ActivityInputForm from "@/components/input/ActivityInputForm";

/** 입력분이 아직 없을 때 계산 훅에 전달할 기본 기간(프리뷰는 렌더하지 않음) */
const FALLBACK_PERIOD = "2025-09";

export default function InputPage() {
  const { activities, products, isLoading, error } = usePCFData();
  const [addedActivities, setAddedActivities] = useState<ActivityData[]>([]);

  const productId = products[0]?.id ?? DEFAULT_PRODUCT_ID;

  // 기존 mock + 이번 세션 입력분 (mock-data 불변, 합쳐서 프리뷰)
  const combined = useMemo(
    () => [...activities, ...addedActivities],
    [activities, addedActivities],
  );

  // 가장 최근 입력 활동 → 프리뷰 기준 월
  const lastAdded =
    addedActivities.length > 0
      ? addedActivities[addedActivities.length - 1]
      : undefined;
  const previewPeriod = lastAdded
    ? getMonthlyPeriodKey(lastAdded.date)
    : null;

  const { current, previous } = usePCFCalculation({
    activities: combined,
    emissionFactors: EMISSION_FACTORS,
    productId,
    period: previewPeriod ?? FALLBACK_PERIOD,
  });

  const periodActivities = useMemo(
    () =>
      previewPeriod
        ? filterActivities(combined, { productId, period: previewPeriod })
        : [],
    [combined, productId, previewPeriod],
  );

  // 방금 입력한 활동의 단건 배출량 (시나리오 1 step 6)
  const lastFactor = lastAdded
    ? findEmissionFactor(lastAdded.category, lastAdded.description)
    : undefined;
  const lastEmission =
    lastAdded && lastFactor
      ? calculateActivityEmission(lastAdded, lastFactor)
      : 0;

  const handleSubmit = (input: ActivityDataInput) => {
    const activity = toActivityData(
      input,
      crypto.randomUUID(),
      new Date().toISOString(),
    );
    setAddedActivities((prev) => [...prev, activity]);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-fg-muted">데이터를 불러오는 중입니다…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-md border border-[color:var(--color-up)]/30 bg-[color:var(--color-up-soft)] px-4 py-3 text-sm text-[color:var(--color-up)]">
          데이터를 불러오지 못했습니다: {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-fg">데이터 입력</h1>
          <p className="mt-1 text-sm text-fg-subtle">
            활동 데이터를 입력하면 우측에서 PCF 프리뷰가 즉시 갱신됩니다.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 입력 폼 */}
          <Card title="활동 추가">
            <ActivityInputForm
              emissionFactors={EMISSION_FACTORS}
              onSubmit={handleSubmit}
            />
            <p className="mt-4 text-xs text-fg-faint">
              입력분은 이 화면에서만 즉시 프리뷰됩니다(새로고침 시 초기화). 영구
              저장과 대시보드 반영은 다음 단계(API) 과제입니다.
            </p>
          </Card>

          {/* PCF 프리뷰 */}
          <div className="flex flex-col gap-6">
            {!lastAdded ? (
              <Card title="PCF 프리뷰">
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                  <span className="text-3xl" aria-hidden>
                    📝
                  </span>
                  <p className="text-sm text-fg-subtle">
                    아직 입력한 데이터가 없습니다.
                  </p>
                  <p className="text-xs text-fg-faint">
                    왼쪽에서 활동을 추가하면 해당 월의 PCF가 여기에 표시됩니다.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* 방금 입력 요약 */}
                <div className="rounded-md border border-[color:var(--color-primary)]/30 bg-[color:var(--color-info-soft)] px-4 py-3 text-sm">
                  <p className="font-medium text-[color:var(--color-primary-soft-fg)]">
                    방금 입력한 활동
                  </p>
                  <p className="mt-1 text-fg-muted">
                    {formatPeriodLabel(previewPeriod!)} ·{" "}
                    {ActivityCategoryLabel[lastAdded.category]} ·{" "}
                    {lastAdded.description} · {formatNumber(lastAdded.amount)}{" "}
                    {lastAdded.unit}
                    {" → "}
                    <span className="font-mono font-semibold text-[color:var(--color-primary-soft-fg)]">
                      {formatEmission(lastEmission)}
                    </span>
                  </p>
                </div>

                {/* 해당 월 총 PCF + 전월 대비 증감 (시나리오 1 step 7) */}
                <PCFSummaryCard
                  totalPCF={current.totalPCF}
                  previousPCF={previous.totalPCF}
                  unit={EMISSION_UNIT}
                  period={previewPeriod!}
                />

                {/* 카테고리별 기여도 */}
                <Card title="카테고리별 배출 기여도">
                  <EmissionBreakdownChart
                    breakdown={current.breakdown}
                    chartType="bar"
                  />
                </Card>

                {/* 해당 월 활동 목록 (기존 + 입력분 합산) */}
                <Card
                  title={`활동 데이터 — ${formatPeriodLabel(previewPeriod!)}`}
                >
                  <ActivityTable
                    activities={periodActivities}
                    period={previewPeriod!}
                  />
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
