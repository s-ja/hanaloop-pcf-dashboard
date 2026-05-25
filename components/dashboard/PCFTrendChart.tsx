"use client";

/**
 * PCFTrendChart — 월별 PCF 시계열 라인 차트 (인터랙티브)
 *
 * 경영자가 추세를, 실무자가 이상치(예: 5월 급등)를 인지하고 클릭으로 드릴다운
 * 하는 진입점입니다 (docs/USER_RESEARCH.md 시나리오 2·3).
 *
 * 포인트(월) 클릭 → onPointClick(period) 으로 페이지의 selectedPeriod 를 갱신
 * 합니다. 상태는 페이지 레벨 보유(Lift State Up) — 본 컴포넌트는 표시 + 클릭
 * 위임만 합니다.
 *
 * recharts 기반 클라이언트 컴포넌트. hover 시 정확 수치를 tooltip 으로 표시.
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";

import type { PCFTrendPoint } from "@/types";
import { ActivityCategoryLabel } from "@/types";
import { formatEmission, formatNumber, formatPeriodLabel } from "@/lib/format";
import { CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/dashboard-config";

interface PCFTrendChartProps {
  data: PCFTrendPoint[];
  onPointClick?: (period: string) => void;
}

/** 축 라벨용 — 'YYYY-MM' → 'M월' (수치가 아닌 날짜 라벨) */
const monthTick = (period: string): string => {
  const month = period.slice(5);
  return month ? `${Number(month)}월` : period;
};

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PCFTrendPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-900">
        {formatPeriodLabel(point.period)}
      </p>
      <p className="mt-1 font-medium text-gray-700">
        총 {formatEmission(point.totalPCF)}
      </p>
      <ul className="mt-1 space-y-0.5">
        {CATEGORY_ORDER.map((category) => (
          <li key={category} className="flex items-center gap-1.5 text-gray-500">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            />
            <span>{ActivityCategoryLabel[category]}</span>
            <span className="ml-auto tabular-nums text-gray-700">
              {formatNumber(point.breakdown[category])}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] text-gray-400">클릭하여 상세 보기</p>
    </div>
  );
}

export default function PCFTrendChart({
  data,
  onPointClick,
}: PCFTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        표시할 트렌드 데이터가 없습니다.
      </div>
    );
  }

  // recharts 3: onClick 은 activeLabel(= X축 dataKey 'period' 값)을 제공합니다.
  const handleClick = (state: MouseHandlerDataParam) => {
    const period = state?.activeLabel;
    if (typeof period === "string" && onPointClick) onPointClick(period);
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          onClick={handleClick}
          style={{ cursor: onPointClick ? "pointer" : "default" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tickFormatter={monthTick}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) => formatNumber(value, 0)}
          />
          <Tooltip content={<TrendTooltip />} />
          <Line
            type="monotone"
            dataKey="totalPCF"
            stroke="#0f766e"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0f766e" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
