# SESSION_LOG.md — 진행 상태 기록

> 각 세션 종료 시 CLAUDE.md 규칙에 따라 갱신합니다.

---

## Session 1 완료 (2026-05-25)

### 완료 파일

**프로젝트 초기화**
- `package.json` — Next.js 16.2.6 + React 19 + TypeScript + Tailwind v4, `packageManager: yarn@1.22.22` 명시, `test` 스크립트 추가
- `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `eslint.config.mjs` — create-next-app 기본 생성물 (경로 별칭 `@/*` → 루트)
- `.gitignore` — `package-lock.json`, `.pnpm-store/` 추가 (PLANNING.md 9-3, yarn 강제)
- `app/` — create-next-app 기본 페이지 (대시보드/입력 페이지는 다음 세션에서 교체)
- `yarn.lock` 생성

**핵심 기반 레이어**
- `types/index.ts` — 도메인 타입 전체 (초안 검수 완료, 수정 없음)
- `lib/constants.ts` — 배출계수 4개 SSOT (초안 검수 완료, 수정 없음)
- `lib/mock-data.ts` — 1~8월 활동 데이터 29건 (초안 검수 완료, 수정 없음)
- `lib/pcf-calculator.ts` — **신규 작성**. 외부 의존성 없는 순수 함수
  - `calculatePCF` / `calculatePCFForPeriod` — 기간별 카테고리 집계
  - `buildMonthlyTrend` — 월별 시계열
  - `filterActivities`, `matchesPeriod`, `getMonthlyPeriodKey` 등 유틸
  - 배출계수는 인자 주입(SSOT는 호출부의 `EMISSION_FACTORS`)
  - 부동소수점 오차 제거를 위해 소수 3자리 반올림

**검증**
- `vitest.config.ts` — `@` 별칭 매핑
- `tests/pcf-calculator.test.ts` — 5월 회귀 테스트 9건

### 검증 결과 (완료 조건 전부 달성)

- ✅ `yarn build` 성공 (TypeScript 통과)
- ✅ `yarn start` 무오류 실행 → HTTP 200
- ✅ 5월 PCF 정확 일치
  - 전기: **100.776** kgCO₂e
  - 원소재: **1,636.8** kgCO₂e
  - 운송: **472.5** kgCO₂e
  - 합계: **2,210.076** kgCO₂e
- ✅ 동일 월 중복 행(전기 120+101, 플라스틱1 424+232, 트럭 123+12) 합산 처리 확인
- ✅ `yarn test` — 9/9 통과

### 다음 세션 주의사항

1. **불변 제약 발효**: `types/index.ts`는 이제 수정 금지. `lib/constants.ts`, `lib/pcf-calculator.ts`도 전 단계 불변 원칙 적용.
2. **버전 메모**: PLANNING.md는 Next.js 15를 가정했으나 `create-next-app@latest`가 **Next.js 16.2.6 + Tailwind v4**를 설치함. App Router 동일, 영향 없음. 단 Next 16은 `next lint`를 제거하여 `lint` 스크립트가 `eslint`로 설정됨.
3. **계산기 시그니처**: 컴포넌트/훅은 `calculatePCFForPeriod(activities, EMISSION_FACTORS, productId, period)` 형태로 호출할 것. 배출계수를 직접 하드코딩하지 말고 `EMISSION_FACTORS`를 전달.
4. **다음 작업(1-B)**: 대시보드 컴포넌트(PCFSummaryCard, EmissionBreakdownChart, PCFTrendChart 등). Recharts는 아직 미설치 — 차트 세션에서 `yarn add recharts` 필요.
5. **app/ 기본 페이지**: 현재 create-next-app 보일러플레이트 상태. `/dashboard`, `/input` 라우트 및 `/` 리다이렉트는 다음 세션에서 구현.
6. **docs 파일명 수정**: `DOMAIN.md,` / `PLANNING.md,` (trailing comma) → 정상 파일명으로 rename 완료.
