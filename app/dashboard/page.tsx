"use client";

/**
 * /dashboard — PCF 대시보드 (경영자 중심, 실무자 드릴다운 지원)
 *
 * 조립 + 상태 보유 페이지입니다 (docs/PLANNING.md 3 디렉토리 구조,
 * docs/USER_RESEARCH.md 시나리오 2·3).
 *
 * 상태(Lift State Up):
 *   - selectedPeriod: 기간 필터 / 트렌드 포인트 클릭으로 갱신. Summary·Breakdown·
 *     ActivityTable 이 모두 이 값에 동기화됩니다.
 *   - chartType: 파이/바 토글.
 *
 * 데이터 흐름: usePCFData(소스 추상화) → usePCFCalculation(계산 메모) → 표시 컴포넌트.
 * 계산은 lib/pcf-calculator, 표시 포매팅은 lib/format, 배출계수는 EMISSION_FACTORS(SSOT).
 *
 * 레이아웃 우선순위(USER_RESEARCH 4-1): Summary → Breakdown + Trend → Goal → Table.
 */

import { useMemo, useState } from "react";

import { EMISSION_UNIT } from "@/types";
import { DEFAULT_PRODUCT_ID, EMISSION_FACTORS } from "@/lib/constants";
import { filterActivities } from "@/lib/pcf-calculator";
import {
  buildDashboardPeriodOptions,
  isYearlyPeriod,
} from "@/lib/period-utils";
import { DEMO_ANNUAL_TARGET_PCF } from "@/lib/dashboard-config";
import { usePCFData } from "@/hooks/usePCFData";
import { usePCFCalculation } from "@/hooks/usePCFCalculation";
import { formatPeriodLabel } from "@/lib/format";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PeriodFilter from "@/components/shared/PeriodFilter";
import PCFSummaryCard from "@/components/dashboard/PCFSummaryCard";
import EmissionBreakdownChart from "@/components/dashboard/EmissionBreakdownChart";
import PCFTrendChart from "@/components/dashboard/PCFTrendChart";
import GoalProgressBar from "@/components/dashboard/GoalProgressBar";
import ActivityTable from "@/components/dashboard/ActivityTable";

/** 기본 기간 — 경영자 관점의 연간 누적 (USER_RESEARCH 시나리오 2) */
const DEFAULT_PERIOD = "2025";

export default function DashboardPage() {
  const { activities, products, isLoading, error } = usePCFData();
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const productId = products[0]?.id ?? DEFAULT_PRODUCT_ID;
  const product = products[0];

  const { current, previous, annual, trend } = usePCFCalculation({
    activities,
    emissionFactors: EMISSION_FACTORS,
    productId,
    period: selectedPeriod,
  });

  const periodOptions = useMemo(
    () => buildDashboardPeriodOptions(trend),
    [trend],
  );

  const periodActivities = useMemo(
    () => filterActivities(activities, { productId, period: selectedPeriod }),
    [activities, productId, selectedPeriod],
  );

  // 목표: 제품에 설정된 targetPCF 우선, 없으면 데모 목표 주입 (mock-data 불변)
  const targetPCF = product?.targetPCF ?? DEMO_ANNUAL_TARGET_PCF;
  const isMonthly = !isYearlyPeriod(selectedPeriod);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-gray-500">데이터를 불러오는 중입니다…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          데이터를 불러오지 못했습니다: {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 헤더 */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">PCF 대시보드</h1>
            <p className="mt-1 text-sm text-gray-500">
              {product?.name ?? productId} · 제품탄소발자국 현황
            </p>
          </div>
          <PeriodFilter
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
            options={periodOptions}
          />
        </header>

        {/* 1. 총 PCF 요약 (최상단 우선순위) */}
        <div className="mb-6">
          <PCFSummaryCard
            totalPCF={current.totalPCF}
            previousPCF={previous.totalPCF}
            unit={EMISSION_UNIT}
            period={selectedPeriod}
          />
        </div>

        {/* 2. 구성(파이/바) + 추세(라인) */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card
            title="카테고리별 배출 기여도"
            action={
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={chartType === "pie" ? "primary" : "ghost"}
                  onClick={() => setChartType("pie")}
                >
                  파이
                </Button>
                <Button
                  size="sm"
                  variant={chartType === "bar" ? "primary" : "ghost"}
                  onClick={() => setChartType("bar")}
                >
                  바
                </Button>
              </div>
            }
          >
            <EmissionBreakdownChart
              breakdown={current.breakdown}
              chartType={chartType}
            />
          </Card>

          <Card title="월별 PCF 추세 (포인트 클릭 → 드릴다운)">
            <PCFTrendChart data={trend} onPointClick={setSelectedPeriod} />
          </Card>
        </div>

        {/* 3. 연간 목표 진척도 */}
        <div className="mb-6">
          <Card title={`연간 목표 진척도 (${annual.period}년 누적)`}>
            <GoalProgressBar
              current={annual.totalPCF}
              target={targetPCF}
              unit={EMISSION_UNIT}
            />
          </Card>
        </div>

        {/* 4. 활동 데이터 드릴다운 */}
        <Card
          title={`활동 데이터 — ${formatPeriodLabel(selectedPeriod)}`}
          action={
            isMonthly ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedPeriod(DEFAULT_PERIOD)}
              >
                연간 보기로
              </Button>
            ) : undefined
          }
        >
          <ActivityTable activities={periodActivities} period={selectedPeriod} />
        </Card>
      </div>
    </main>
  );
}
