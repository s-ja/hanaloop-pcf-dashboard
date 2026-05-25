"use client";

/**
 * usePCFCalculation — 계산 결과 메모이제이션 훅
 *
 * 계산은 전적으로 lib/pcf-calculator 에 위임하고, 본 훅은 호출과 useMemo 메모만
 * 담당합니다 (컴포넌트 내부 계산 금지 — CLAUDE.md 불변 제약).
 *
 * 반환값:
 *   - current : 선택 기간의 PCF 결과 (Summary / Breakdown / ActivityTable 용)
 *   - previous: 직전 기간의 PCF 결과 (Summary 증감 표시용)
 *   - annual  : 선택 기간이 속한 연도의 누적 PCF (GoalProgressBar 용 — 월 선택과
 *               무관하게 항상 연간 목표 진척도를 보여주기 위함)
 *   - trend   : 월별 시계열 (PCFTrendChart 용)
 *
 * 배출계수는 호출부에서 EMISSION_FACTORS 를 주입받습니다(SSOT).
 */

import { useMemo } from "react";

import type {
  ActivityData,
  EmissionFactor,
  PCFCalculationResult,
  PCFTrendPoint,
} from "@/types";
import {
  buildMonthlyTrend,
  calculatePCFForPeriod,
} from "@/lib/pcf-calculator";
import { getPreviousPeriod, getYearOfPeriod } from "@/lib/period-utils";

interface UsePCFCalculationArgs {
  activities: readonly ActivityData[];
  emissionFactors: readonly EmissionFactor[];
  productId: string;
  /** 선택 기간 ('YYYY' | 'YYYY-MM') */
  period: string;
}

export interface PCFCalculationState {
  current: PCFCalculationResult;
  previous: PCFCalculationResult;
  annual: PCFCalculationResult;
  trend: PCFTrendPoint[];
}

export function usePCFCalculation({
  activities,
  emissionFactors,
  productId,
  period,
}: UsePCFCalculationArgs): PCFCalculationState {
  const current = useMemo(
    () => calculatePCFForPeriod(activities, emissionFactors, productId, period),
    [activities, emissionFactors, productId, period],
  );

  const previous = useMemo(
    () =>
      calculatePCFForPeriod(
        activities,
        emissionFactors,
        productId,
        getPreviousPeriod(period),
      ),
    [activities, emissionFactors, productId, period],
  );

  const annual = useMemo(
    () =>
      calculatePCFForPeriod(
        activities,
        emissionFactors,
        productId,
        getYearOfPeriod(period),
      ),
    [activities, emissionFactors, productId, period],
  );

  const trend = useMemo(
    () => buildMonthlyTrend(activities, emissionFactors, productId),
    [activities, emissionFactors, productId],
  );

  return { current, previous, annual, trend };
}
