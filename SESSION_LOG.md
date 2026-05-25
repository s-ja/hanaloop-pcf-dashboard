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

---

## Session 2 완료 (2026-05-25)

### 완료 파일

**유틸 레이어 (순수 함수, 외부 의존성 없음)**
- `lib/format.ts` — 표시 포매팅
  - `formatNumber` (천 단위 구분), `formatEmission` (값+kgCO₂e), `formatPeriodLabel`
    ('2025-05'→'2025년 5월', '2025'→'2025년'), `formatPercent`, `formatPercentChange`
    (PCFSummaryCard 증감 표시용, previous=0 시 '—')
  - 단위는 `@/types`의 `EMISSION_UNIT` 사용 (하드코딩 없음)
- `lib/validators.ts` — `ActivityDataInput` 검증
  - `validateActivityInput(Partial<ActivityDataInput>)` → 필드별 한국어 에러 맵
  - amount(숫자·0초과), 카테고리-단위 정합성, description-배출계수 매칭(`findEmissionFactor`),
    date(YYYY-MM-DD + 실재 날짜) 검증
  - `hasActivityInputErrors` 헬퍼. 배출계수 '값' 하드코딩 없음(조회만), 카테고리→단위는
    구조적 매핑(ActivityUnit 파생)

**공유 컴포넌트 (`components/shared/`, 표시 전용 — 도메인 로직 없음)**
- `ScopeTag.tsx` (서버) — 4개 Scope 색상+기호(S1/S2/S3↑/S3↓, 색맹 접근성) + native title 툴팁
- `UnitLabel.tsx` (서버) — 단위 표기 (mono)
- `EmissionFactorBadge.tsx` (서버) — 출처·버전·유효시점 배지
- `PeriodFilter.tsx` (**'use client'** — onChange) — 기간 select, 기본 옵션 2025 연간+12개월,
  `options` prop 으로 override 가능

**UI 프리미티브 (`components/ui/`)**
- `Button.tsx` (**'use client'**) — variant(primary/secondary/ghost) × size(sm/md)
- `Card.tsx` (서버) — title/action/children 컨테이너

**임시 검증 라우트**
- `app/test/page.tsx` (**'use client'** — PeriodFilter 상태 보유) — 6개 컴포넌트 +
  format/validators 출력 렌더. ⚠️ **통합 세션(3·4)에서 제거 예정**

**테스트 (권장 항목)**
- `tests/format.test.ts` (16건), `tests/validators.test.ts` (16건)

### 검증 결과 (완료 조건 전부 달성)

- ✅ `yarn build` 성공 (TypeScript 통과, `/test` 라우트 컴파일 — `/`, `/test` prerender)
- ✅ `yarn start` 무오류 실행 (clean) → `/` 200, `/test` 200
- ✅ `/test` HTML 에 6개 컴포넌트 + format/validators 출력 정상 렌더 (Scope 라벨, kgCO₂e,
  '2025년 5월', 검증 에러 메시지 확인)
- ✅ `yarn lint` clean
- ✅ `yarn test` — 32/32 통과 (기존 9 + 신규 23)

### 다음 세션 주의사항

1. **`app/test/page.tsx` 제거 대상**: Session 3·4 통합 시 삭제할 것. (임시 검증 전용)
2. **import 경로**: 공유 컴포넌트는 default export. 예: `import ScopeTag from "@/components/shared/ScopeTag"`.
   format/validators 는 named export.
3. **PeriodFilter 옵션**: 기본은 2025 연간+12개월. 대시보드에서 실제 데이터 기간만 노출하려면
   `options` prop 에 `buildMonthlyTrend` 결과의 period 목록 등을 전달.
4. **Button/PeriodFilter 는 클라이언트 컴포넌트** — 서버 컴포넌트 페이지에서 직접 렌더 가능하나
   상태는 페이지 레벨로 끌어올릴 것(Lift State Up).
5. **신규 패키지 추가 없음** — 의존성 변화 없이 완료. recharts 는 여전히 미설치(차트 세션 범위).
