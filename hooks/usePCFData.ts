"use client";

/**
 * usePCFData — 데이터 소스 추상화 훅
 *
 * 컴포넌트가 의존하는 단일 데이터 경계입니다. Phase 1 에서는 mock-data 를 그대로
 * 반환하지만, Phase 2 에서 lib/api-client 로 교체되더라도 컴포넌트는 본 훅의
 * 시그니처(데이터 + isLoading + error)만 의존하므로 영향을 받지 않습니다.
 * (docs/PLANNING.md 4-3 단계별 불변 매트릭스)
 *
 * 현재는 즉시 resolve 되지만, 로딩/에러 상태 형태를 미리 노출하여 향후 비동기
 * 패칭 전환에 대비합니다 (docs/USER_RESEARCH.md 6장 로딩·에러 상태 명시).
 */

import type { ActivityData, Product } from "@/types";
import { MOCK_ACTIVITY_DATA, MOCK_PRODUCTS } from "@/lib/mock-data";

export interface PCFDataState {
  /** 활동 데이터 전체 */
  activities: readonly ActivityData[];
  /** 제품 목록 */
  products: readonly Product[];
  /** 데이터 로딩 중 여부 (Phase 2 비동기 전환 대비) */
  isLoading: boolean;
  /** 데이터 로드 실패 시 에러 (없으면 null) */
  error: Error | null;
}

/**
 * Phase 1 구현: mock-data 를 동기적으로 반환합니다.
 *
 * Phase 2 전환 시 본 함수 내부만 apiClient.fetchActivities() 등으로 교체하고
 * useEffect + useState 로 비동기 상태를 채우면 됩니다. 반환 타입은 동일하게
 * 유지됩니다.
 */
export function usePCFData(): PCFDataState {
  return {
    activities: MOCK_ACTIVITY_DATA,
    products: MOCK_PRODUCTS,
    isLoading: false,
    error: null,
  };
}
