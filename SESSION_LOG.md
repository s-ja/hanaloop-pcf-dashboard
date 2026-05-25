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

---

## Session 3 완료 (2026-05-25)

### 완료 파일

**의존성**
- `recharts@3.8.1` 추가 (PLANNING 6-1-3 확정 차트 라이브러리). 그 외 신규 패키지 없음.

**데이터/계산 경계 (hooks/)**
- `hooks/usePCFData.ts` (**'use client'**) — 데이터 소스 추상화. mock-data 반환 +
  `{ activities, products, isLoading, error }` 시그니처로 Phase 2 api-client 전환 대비.
- `hooks/usePCFCalculation.ts` (**'use client'**) — `useMemo`로 current/previous/annual/trend
  메모. 계산은 전적으로 `lib/pcf-calculator`에 위임, 배출계수는 `EMISSION_FACTORS` 주입.

**표시 보조 유틸 (순수 함수)**
- `lib/period-utils.ts` — `getPreviousPeriod`(증감 비교용), `isYearlyPeriod`, `getYearOfPeriod`,
  `buildDashboardPeriodOptions`(데이터 존재 기간만 필터 옵션 구성).
- `lib/dashboard-config.ts` — `DEMO_ANNUAL_TARGET_PCF`(12,000), `CATEGORY_COLORS`, `CATEGORY_ORDER`.
  **표시 계층 전용** — 배출계수 등 도메인 값은 두지 않음.

**대시보드 컴포넌트 (components/dashboard/, PLANNING 5-1 props 준수)**
- `PCFSummaryCard.tsx` (서버) — 총 PCF + 증감(↑/↓ 색상+아이콘, 색맹 대비). previous=0 시 '—'.
- `EmissionBreakdownChart.tsx` (**'use client'**) — recharts 파이/바, hover tooltip 정확 수치+비율.
- `PCFTrendChart.tsx` (**'use client'**) — 월별 라인, 포인트 클릭 → `onPointClick(period)`.
  recharts 3 의 onClick 은 `activeLabel`(=dataKey 'period')을 제공 → 이를 사용.
- `GoalProgressBar.tsx` (서버) — 연간 목표 게이지. target 부재 시 빈 상태, 초과=빨강/임박=노랑/이내=초록.
- `ActivityTable.tsx` (서버) — 개별 활동 + 합계 행(합산값). ScopeTag·UnitLabel·EmissionFactorBadge 재사용,
  행별 배출량은 `calculateActivityEmission`, 계수 조회는 `findEmissionFactor`.

**페이지 조립/라우팅**
- `app/dashboard/page.tsx` (**'use client'**) — selectedPeriod·chartType 페이지 레벨 보유(Lift State Up).
  PeriodFilter + 트렌드 클릭이 Summary/Breakdown/Table 동기화. 레이아웃: Summary→Breakdown+Trend→Goal→Table.
- `app/page.tsx` — `/` → `/dashboard` 리다이렉트(보일러플레이트 교체).
- `app/layout.tsx` — metadata title/description 갱신("HanaLoop PCF Dashboard").

**임시 라우트 제거**
- `app/test/page.tsx` 및 `app/test/` 디렉토리 **삭제** (Session 2 임시 검증용. 대시보드가 공유 컴포넌트를 실사용하므로 제거).

**테스트**
- `tests/period-utils.test.ts` (8건) — getPreviousPeriod(연/월 경계 포함)·옵션 구성 검증.

**기타**
- `.claude/launch.json` — preview 용 dev 서버 구성(`pcf-dev`, port 3000).

### 검증 결과 (완료 조건 전부 달성)

- ✅ `yarn build` 성공(TypeScript 통과). `/`, `/dashboard` prerender.
- ✅ `yarn start` clean 실행(포트 3000 선점 해제 후) → `/` 307 리다이렉트 → `/dashboard` 200.
- ✅ **이탄소 이사 시나리오**: 진입 즉시 ① 총 PCF(연간 11,022.564 kgCO₂e) ② 카테고리 파이 ③ 월별 트렌드가 한 화면.
- ✅ **드릴다운**: 트렌드 5월 포인트 클릭 → selectedPeriod='2025-05' 갱신 → Breakdown/Summary/Table 동기화 확인(브라우저 검증).
  5월 합산+개별 행(전기 120+101, 플라스틱1 424+232, 트럭 123+12) 테이블에 모두 표시.
- ✅ 차트 인터랙티브(hover tooltip 정확 수치), 단위 `kgCO₂e` 일관(`@/lib/format`).
- ✅ 연간 목표 진척도: 11,022.564 / 12,000 = 92% '목표 임박'(amber). target 부재 시 빈 상태 처리도 구현.
- ✅ `yarn lint` clean, `yarn test` 40/40 통과(기존 32 + 신규 8).

### 다음 세션 주의사항 (Session 4 — /input)

1. **공유 컴포넌트 재사용**: `validateActivityInput`/`hasActivityInputErrors`(lib/validators), ScopeTag·UnitLabel·
   EmissionFactorBadge, Button·Card 그대로 사용. 폼 검증 에러 메시지는 체크리스트 필수 항목.
2. **데이터 흐름**: `usePCFData` 가 현재 mock 반환(즉시 resolve, 읽기 전용). 입력 추가는 Phase 1 범위상
   클라이언트 상태로만 프리뷰하거나 Session 범위 확정 필요(api-client/POST 는 Phase 2). 입력 즉시 PCF 프리뷰는
   `calculatePCF`/`usePCFCalculation` 재사용 가능.
3. **PeriodFilter `options`**: 대시보드는 `buildDashboardPeriodOptions(trend)`로 실제 데이터 기간만 노출.
4. **recharts SSR 주의**: 차트 컴포넌트는 'use client'. prerender 시 ResponsiveContainer width/height(-1)
   경고가 빌드 로그에 출력되나 동작/빌드에 영향 없음(클라이언트에서 정상 사이징).
5. **계산기/타입/상수/mock-data 여전히 불변**. 표시·설정은 lib/dashboard-config, lib/period-utils 처럼 새 파일로 추가.

---

## Session 4 완료 (2026-05-25)

### 완료 파일

**입력 폼 보조 유틸 (순수 함수, 신규)**
- `lib/input-helpers.ts` — 폼 옵션 도출 + 입력값 변환. 모두 EMISSION_FACTORS 에서 파생(하드코딩 없음).
  - `getInputCategories` — 마스터의 카테고리 목록(중복 제거)
  - `getSourceOptions(factors, category)` — 카테고리별 배출원(설명) 옵션
  - `getUnitForCategory(factors, category)` — 배출계수 단위('kgCO₂e/kWh')의 '/' 뒤를
    활동 단위로 추출 → 전기↔kWh 매핑조차 하드코딩하지 않음
  - `toActivityData(input, id, createdAt)` — ActivityDataInput → ActivityData 조립(순수)

**입력 컴포넌트 (components/input/, PLANNING 5-2 props 준수)**
- `ActivityFormField.tsx` (**'use client'**) — label+컨트롤+에러 단위 래퍼. useId + cloneElement 로
  단일 자식 컨트롤에 `id`/`aria-invalid`/`aria-describedby` 자동 연결, label `htmlFor` 결합.
  에러는 색상+텍스트(⚠)+`role="alert"`(색맹 대비). 시그니처 `{ label, error?, children }` 유지.
- `ActivityInputForm.tsx` (**'use client'**) — 카테고리→단위 자동 고정·표시(UnitLabel), 배출원
  옵션은 input-helpers 로 파생, 선택 계수의 출처/버전/Scope 를 EmissionFactorBadge+ScopeTag 로 노출.
  검증은 `validateActivityInput`만 호출(중복 규칙 없음), `hasActivityInputErrors`로 제출 버튼 비활성 제어,
  에러는 blur/제출 시 노출. 제출 시 productId=DEFAULT_PRODUCT_ID, emissionFactorId 해석해 onSubmit 위임 후 리셋.

**페이지 조립/상태 (신규)**
- `app/input/page.tsx` (**'use client'**) — usePCFData 로드 + 이번 세션 입력분을 페이지 레벨
  `addedActivities: ActivityData[]` 로 보관(id/createdAt 은 제출 시 `crypto.randomUUID()`+ISO now).
  "기존 mock + 입력분"을 합쳐(`combined`) 최근 입력 월을 usePCFCalculation 으로 계산 → 단건 배출량 콜아웃 +
  PCFSummaryCard(전월 대비) + EmissionBreakdownChart + ActivityTable 로 즉시 프리뷰. 로딩/에러/빈 상태 처리.
  **mock-data 불변**(합치기만), 새로고침 시 입력분 초기화 — Phase 2 영속화 경계를 화면 주석으로 명시.

**내비게이션 (신규)**
- `components/shared/AppNav.tsx` (**'use client'**) — usePathname 으로 현재 경로 강조하는 /dashboard↔/input 링크.
- `app/layout.tsx` — body 최상단에 `<AppNav />` 삽입(두 페이지 일관 적용).

**테스트**
- `tests/input-helpers.test.ts` (6건) — 옵션 도출(카테고리/배출원/단위 파생)·toActivityData 검증.

### 검증 결과 (완료 조건 전부 달성)

- ✅ `yarn build` 성공(TypeScript 통과). `/`, `/dashboard`, `/input` prerender(static).
- ✅ `yarn start` clean(포트 3000 선점 해제 후) → `/` 307 → `/dashboard` 200, `/input` 200.
- ✅ **김환경 주임 시나리오 1**(브라우저 검증): ① "전기" 선택 → 단위 `kWh` 자동 표시, "한국전력" 선택 시
  "KEPCO-2025" 배지 + Scope 2 노출 ② 2025-09-01 / 125 입력 → 에러 없음 ③ 제출 → "125 kWh → 57 kgCO₂e"
  단건 배출 + 2025년 9월 총 PCF 57 kgCO₂e, **전월(8월) 대비 ↓-94%** 표시, 카테고리 차트·9월 활동 테이블 갱신.
- ✅ **에러 메시지 검증**(체크리스트 필수): 활동량 -5 입력+blur → "활동량은 0보다 커야 합니다."
  필드 에러 + `aria-invalid="true"` + `aria-describedby` 로 메시지 연결 확인. 검증은 전적으로 validateActivityInput 사용.
- ✅ 단위 표기 `kgCO₂e` 일관(@/lib/format), Scope/단위/계수 배지·Button·Card 는 Session 2/3 공유 컴포넌트 재사용.
- ✅ `yarn lint` clean, `yarn test` 46/46 통과(기존 40 + 신규 6). 콘솔 에러 없음.

### 다음 세션 주의사항 (Phase 2 — API Routes)

1. **크로스 페이지 동기화는 Phase 2 과제**: /input 입력분은 현재 페이지 인메모리 상태로만 프리뷰되고
   /dashboard 에 반영되지 않음. api-client + POST(app/api/activities) 도입 시 usePCFData 내부만 교체하면
   두 페이지가 동일 소스를 공유하게 됨(usePCFData 시그니처 불변 유지).
2. **제출 분기점**: ActivityInputForm.onSubmit 은 ActivityDataInput 을 그대로 위임함. Phase 2 에서는
   페이지의 `setAddedActivities` 대신 `apiClient.createActivity(input)` 호출로 교체(폼 props 불변).
3. **ActivityFormField 의 cloneElement 전제**: 자식은 단일 폼 컨트롤이어야 a11y 속성이 올바른 요소에
   주입됨(이번에 단위 suffix div 래핑 → 라벨에 단위 표기로 변경한 이유). 새 필드 추가 시 이 전제 준수.
4. **계산기/타입/상수/mock-data 여전히 불변**. 입력 보조는 lib/input-helpers 처럼 새 파일로만 추가.
5. **신규 패키지 추가 없음** — 의존성 변화 없이 완료.

---

## Session 5 사전 준비 — 디자인 핸드오프 0단계 (2026-05-26)

> Session 5(디자인 통합) 본 작업은 별도 Claude Code 대화에서 진행. 본 항목은 그 전 단계인
> "핸드오프 계약 패키징"(Claude Code → claude.ai 디자인 전달용) 결과만 기록한다.

### 완료 파일
- `docs/DESIGN_HANDOFF.md` — 두 surface(claude.ai 디자인 ↔ Claude Code) 공유 계약. 스코프(IN/OUT),
  동결 props 인벤토리(14개 컴포넌트), 도메인 UX 불변 규칙, 현행 토큰 인벤토리, 결정 항목(D1~D3),
  baseline 스크린샷 세트(파일명 매핑)·재캡처 방법, 핸드백 포맷, Session 5 통합·검증 체크리스트 포함.
- `scripts/capture-baseline.mjs` — Playwright fullPage 캡처 스크립트. 라우트×뷰포트(+CAPTURE_DARK 옵션)
  반복 캡처. Session 5 before/after 시각 회귀에도 재사용.
- `docs/design/baseline/*.png` — baseline 5종(아래) 실제 생성.

### baseline 스크린샷 (docs/design/baseline/, claude.ai 첨부용)
- `dashboard-desktop-1280.png` / `dashboard-mobile-375.png` / `dashboard-tablet-800.png`
- `input-desktop-1280.png`(시나리오1 입력 후) / `input-mobile-375.png`(빈 상태)
- 현행 라이트 모드만(다크 미구현). 재캡처: `npx playwright install chromium` → `yarn dev` →
  `node scripts/capture-baseline.mjs`.

### 의존성
- `playwright`(dev) 추가 — baseline/회귀 캡처 전용(런타임 영향 없음). 브라우저는 `npx playwright install chromium`.

### 확정된 스코프 조정 (사용자 결정)
- 다크 모드를 **수동 토글**로 구현(테마 상태/영속 기능 코드 추가 허용) — 결정 D1.
- recharts 차트 색 **토큰화** 허용(축/그리드/카테고리 색을 CSS 변수에서 읽음) — 결정 D3.
- 위 둘 외에는 "스타일/표시 토큰 교체"로 한정. 계산·검증·데이터·props·라우팅은 불변.

### 환경 메모
- PR #1 머지로 `@vercel/analytics`가 package.json/layout.tsx에 반영됨 → `yarn install`로 node_modules 동기화
  완료(미설치 시 빌드 실패). 신규 추가가 아닌 선언된 의존성 설치.

### Session 5(본 작업) 진입 조건
1. 1단계(claude.ai 디자인)에서 @theme 토큰 세트(라이트/다크)·컴포넌트 className 스니펫·상태/반응형 시안 수령.
2. 새 대화는 CLAUDE.md 선행 순서대로 docs 3종 + 본 SESSION_LOG + `docs/DESIGN_HANDOFF.md`를 읽고 2단계 착수.
3. D2(모바일 ActivityTable 방식)는 디자인 시안 수령 후 확정.
