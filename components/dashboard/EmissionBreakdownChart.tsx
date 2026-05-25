"use client";

/**
 * EmissionBreakdownChart — 카테고리별 배출 기여도 (파이/바)
 *
 * 전기/원소재/운송의 기여 비중을 시각화합니다 (docs/USER_RESEARCH.md 4-1,
 * 시나리오 2: "원소재가 70% 차지 → 감축 우선순위 즉시 파악").
 *
 * recharts 기반이므로 클라이언트 컴포넌트입니다. hover 시 정확한 수치를
 * tooltip 으로 표시합니다(과제 인터랙티브 요구사항). 수치/단위는 lib/format 을
 * 거칩니다.
 *
 * props 는 PLANNING 5-1 시그니처 유지: breakdown 객체 단위 수용(차트는 객체가
 * 자연스러움 — PLANNING 5-4).
 */

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ActivityCategory, PCFCalculationResult } from "@/types";
import { ActivityCategoryLabel } from "@/types";
import { formatEmission, formatPercent } from "@/lib/format";
import { CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/dashboard-config";

interface EmissionBreakdownChartProps {
  breakdown: PCFCalculationResult["breakdown"];
  chartType?: "pie" | "bar";
}

interface ChartDatum {
  category: ActivityCategory;
  label: string;
  value: number;
  color: string;
}

const buildData = (
  breakdown: PCFCalculationResult["breakdown"],
): ChartDatum[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    label: ActivityCategoryLabel[category],
    value: breakdown[category],
    color: CATEGORY_COLORS[category],
  }));

/** hover tooltip — 정확한 수치 + 전체 대비 비율 */
function BreakdownTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const ratio = total > 0 ? datum.value / total : 0;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-900">{datum.label}</p>
      <p className="mt-0.5 text-gray-700">{formatEmission(datum.value)}</p>
      <p className="text-gray-500">
        전체의 {formatPercent(ratio, { signed: false, fractionDigits: 1 })}
      </p>
    </div>
  );
}

export default function EmissionBreakdownChart({
  breakdown,
  chartType = "pie",
}: EmissionBreakdownChartProps) {
  const data = buildData(breakdown);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total <= 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        표시할 배출 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((d) => (
                <Cell key={d.category} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<BreakdownTooltip total={total} />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={<BreakdownTooltip total={total} />}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.category} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
