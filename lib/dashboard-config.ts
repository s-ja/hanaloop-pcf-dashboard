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

/**
 * 카테고리별 차트 색상 (표시 전용 토큰).
 *
 * D3(docs/DESIGN_HANDOFF.md): hex 직접 지정 대신 app/globals.css 의 CSS 변수
 * (--chart-cat-*)를 참조합니다. 다크 토글 시 변수 캐스케이드로 색이 즉시
 * 전환되며, recharts 의 fill/stroke 와 DOM 인라인 style 양쪽에서 동작합니다.
 * 색의 '의미'(전기↔S2 sky, 원소재↔S3↑ emerald, 운송 amber)는 변수에서 유지됩니다.
 */
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  electricity: "var(--chart-cat-electricity)", // = S2 sky 계열
  material: "var(--chart-cat-material)", // = S3↑ emerald 계열
  transport: "var(--chart-cat-transport)", // amber
};

/** 차트 범례/표 표시용 카테고리 순서 (큰 기여 → 작은 기여 경향) */
export const CATEGORY_ORDER: readonly ActivityCategory[] = [
  "material",
  "transport",
  "electricity",
];
