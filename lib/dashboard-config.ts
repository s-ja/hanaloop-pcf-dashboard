/**
 * 대시보드 표시 설정 (데모용)
 *
 * 본 파일은 도메인 상수(lib/constants.ts)나 과제 데이터(lib/mock-data.ts)를
 * 수정하지 않기 위한 "표시 계층" 설정입니다. 다음 두 가지를 제공합니다.
 *
 *  1) 데모 연간 목표 PCF — MOCK_PRODUCTS[0] 에 targetPCF 가 없어(과제 데이터
 *     미설정) GoalProgressBar 데모를 위해 주입하는 값. 제품에 targetPCF 가
 *     설정되어 있으면 그 값이 우선하고, 없을 때만 본 값을 사용합니다.
 *     (값 부재 시 GoalProgressBar 는 빈 상태로 처리 — 양쪽 모두 대응)
 *
 *  2) 카테고리별 차트 색상 — 차트/범례에서 카테고리를 일관된 색으로 표현하기
 *     위한 표시 전용 팔레트. 배출계수 값과 무관한 UI 토큰입니다.
 *
 * 도메인 값(배출계수 등)은 절대 본 파일에 두지 않습니다.
 */

import type { ActivityCategory } from "@/types";

/**
 * 데모 연간 목표 PCF (kgCO₂e).
 *
 * 과제 데이터(2025-01~08)의 연간 누적 PCF(약 11,023 kgCO₂e)를 기준으로, 목표
 * 대비 진척도를 의미 있게 보여주기 위한 데모 목표치입니다. 실제 제품에
 * targetPCF 가 설정되면 그 값으로 대체됩니다.
 */
export const DEMO_ANNUAL_TARGET_PCF = 12_000;

/** 카테고리별 차트 색상 (표시 전용 토큰) */
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  electricity: "#0284c7", // sky-600 — Scope 2
  material: "#059669", // emerald-600 — Scope 3 업스트림
  transport: "#d97706", // amber-600 — Scope 3 업스트림
};

/** 차트 범례/표 표시용 카테고리 순서 (큰 기여 → 작은 기여 경향) */
export const CATEGORY_ORDER: readonly ActivityCategory[] = [
  "material",
  "transport",
  "electricity",
];
