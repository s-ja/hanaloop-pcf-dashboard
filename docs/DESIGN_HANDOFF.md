# DESIGN_HANDOFF.md — Session 5 디자인 통합 핸드오프 계약

> 본 문서는 **Claude Design(claude.ai)** 과 **Claude Code** 두 surface 사이의 공유 계약입니다.
> 프롬프트 복붙이 아니라, 레포에 상주하는 이 문서 + baseline 스크린샷을 운반물로 사용합니다.
>
> 워크플로우: **0단계**(이 문서 작성, Claude Code) → **1단계**(claude.ai 디자인 산출) → **2단계**(Claude Code Session 5 통합).
> 선행 문서: docs/PLANNING.md(8·10장 AI 도구 역할), docs/USER_RESEARCH.md(페르소나), docs/DOMAIN.md(표기 규칙), SESSION_LOG.md.

---

## 1. Session 5 스코프

### 변경 허용 (IN)
- 시각 토큰: 색 팔레트, 타이포 스케일, 간격/그리드, radius, shadow
- 차트 색(파이/바/라인) 및 범례
- 반응형(모바일 375 ~ 데스크탑 1280)
- **다크 모드 — 수동 토글** (결정 D1)
- 상태 UI 시각 보강(로딩/에러/빈/포커스/disabled/검증 에러)

### 불변 (OUT — 절대 변경 금지)
- 계산 `lib/pcf-calculator`, 검증 `lib/validators`, 데이터 `lib/mock-data`·`lib/constants`, 타입 `types/index.ts`
- **컴포넌트 props 인터페이스**(PLANNING 5-1/5-2) — 새 prop 추가·시그니처 변경 금지
- 라우팅(`/`→`/dashboard`, `/dashboard`, `/input`)
- 도메인 표시 규칙(3장)

### 스코프 조정 메모 (사용자 확정)
원안은 "스타일만"이었으나, 아래 두 가지로 **확장**됨:
- **다크 모드를 수동 토글로 구현** → 테마 상태/영속(클라이언트) 기능 코드 추가 허용.
- **recharts 다크 대응** → 차트 색을 토큰(CSS 변수)에서 읽는 미세 로직 추가 허용.
- 단, 위 두 가지를 제외한 나머지는 여전히 "스타일/표시 토큰 교체"로 한정하며, 계산·검증·데이터·props는 불변.

---

## 2. 컴포넌트 인벤토리 (동결 props — 디자인은 이 시그니처를 그대로 가정)

| 컴포넌트 | 경로 | 렌더 | 동결 props | 비고 |
|---|---|---|---|---|
| `AppNav` | components/shared/AppNav.tsx | 'use client' | (없음) | usePathname active. **다크 토글 배치 후보** |
| `Button` | components/ui/Button.tsx | 'use client' | `variant(primary/secondary/ghost)`, `size(sm/md)`, 기타 button attrs | primary=sky-600 |
| `Card` | components/ui/Card.tsx | server | `title?`, `action?`, `children`, `className?` | 섹션 컨테이너 |
| `ScopeTag` | components/shared/ScopeTag.tsx | server | `scope` | 색+기호 병행(색맹) |
| `UnitLabel` | components/shared/UnitLabel.tsx | server | `unit` | mono |
| `EmissionFactorBadge` | components/shared/EmissionFactorBadge.tsx | server | `version`, `source`, `validFrom` | 배지 |
| `PeriodFilter` | components/shared/PeriodFilter.tsx | 'use client' | `selected`, `onChange`, `options?` | select |
| `PCFSummaryCard` | components/dashboard/PCFSummaryCard.tsx | server | `totalPCF`, `previousPCF`, `unit`, `period` | 증감 색+↑/↓ |
| `EmissionBreakdownChart` | components/dashboard/EmissionBreakdownChart.tsx | 'use client' | `breakdown`, `chartType?(pie/bar)` | **recharts(D3)** |
| `PCFTrendChart` | components/dashboard/PCFTrendChart.tsx | 'use client' | `data`, `onPointClick?` | **recharts(D3)** |
| `GoalProgressBar` | components/dashboard/GoalProgressBar.tsx | server | `current`, `target`, `unit` | 초과=빨강/임박=노랑/이내=초록 |
| `ActivityTable` | components/dashboard/ActivityTable.tsx | server | `activities`, `period?` | min-w-[720px] 가로 스크롤 (D2) |
| `ActivityFormField` | components/input/ActivityFormField.tsx | 'use client' | `label`, `error?`, `children` | useId+cloneElement a11y |
| `ActivityInputForm` | components/input/ActivityInputForm.tsx | 'use client' | `emissionFactors`, `onSubmit` | 단일 컨트롤 자식 전제 |

페이지: `app/dashboard/page.tsx`('use client', selectedPeriod·chartType 보유), `app/input/page.tsx`('use client', addedActivities 보유).

---

## 3. 도메인 UX 불변 규칙 (디자인이 반드시 보존)

- 배출량 단위 표기는 **`kgCO₂e`** 로 통일(DOMAIN 2-1).
- 증감: **증가=빨강(악화), 감소=초록(개선)** + **↑/↓ 아이콘 병행**(색만으로 신호 금지 — 색맹 접근성, USER_RESEARCH 6장).
- **Scope 색 의미 고정**: S1 amber, S2 sky, S3↑ emerald, S3↓ violet. (재색상화하더라도 4종 구분 + 기호 병행 유지)
- 수치는 **천 단위 구분자**(`12,345`).
- **WCAG AA** 대비비 충족(특히 배지·보조 텍스트·다크 모드 양쪽).
- 로딩/에러/빈 상태를 각각 명시적 UI로 유지.

---

## 4. 현행 토큰 인벤토리 — "유지할 *의미* vs 바꿀 *시각*"

| 토큰 출처 | 현재 값 | 의미(유지) | 시각(재정의 가능) |
|---|---|---|---|
| `CATEGORY_COLORS` (lib/dashboard-config.ts) | electricity `#0284c7`(sky-600), material `#059669`(emerald-600), transport `#d97706`(amber-600) | 카테고리 식별 | hex는 디자인이 재정의 가능 |
| `SCOPE_CONFIG` (ScopeTag) | S1 amber / S2 sky / S3↑ emerald / S3↓ violet | **의미 고정** | 명도/채도 조정만 |
| `Button` variant | primary sky-600 / secondary white+border / ghost transparent | 위계 | 팔레트 교체 가능 |
| 회색 스케일 | gray-50(배경)·200(보더)·500(보조텍스트)·900(본문), bg-white(카드) | 위계 | 라이트/다크 쌍으로 재정의 |

> ⚠️ **정합성 주의**: `CATEGORY_COLORS`의 전기=sky(=S2 색), 원소재=emerald(=S3↑ 색)가 Scope 색과 겹칩니다. 의도된 연계(전기↔Scope2)인지, 분리할지 디자인에서 **명시 결정**해 주세요.

---

## 5. 확정/미결 결정 항목

- **D1 — 다크 모드 = 수동 토글 (확정)**: 초기값은 `prefers-color-scheme`, 사용자가 토글로 override + `localStorage` 영속. Tailwind v4 클래스 전략 `@custom-variant dark (&:where(.dark, .dark *))`(globals.css). 토글 UI는 **AppNav 우측**에 배치 권장(아이콘 버튼). 신규 패키지 없이 자체 구현.
- **D2 — 모바일 ActivityTable (디자인이 택1 제시 요청)**: 현재 `min-w-[720px]` + 가로 스크롤. 모바일에서 ① 가로 스크롤 유지 ② 행→카드형 전환 중 택1 시안 요청. (props 불변 전제 — 표시만 전환)
- **D3 — recharts 다크 = 토큰화 허용 (확정)**: 축/그리드 색(현재 인라인 `#6b7280`, `#e5e7eb`)과 `CATEGORY_COLORS`를 CSS 변수에서 읽도록 변경. 라이트/다크 변수 쌍을 토큰 세트에 포함 요청.

---

## 6. 스택/구현 제약

- **Tailwind v4**: 커스텀 토큰은 `app/globals.css`의 `@theme` 블록에 선언(`tailwind.config.ts` 없음).
- 컴포넌트는 **default export**, `'use client'` 경계 유지(인벤토리 표 기준).
- 신규 **런타임** 패키지는 보고 후 추가(다크 토글은 자체 구현 → 불필요 예상).
- 검증 기준: `yarn build` → `yarn start`, `yarn lint`, `yarn test`(현재 46건) 회귀 0.

---

## 7. Baseline 스크린샷 세트

> 아래는 Session 4 대화에서 preview 도구로 캡처됨(현행 라이트 모드). claude.ai 디자인에 **이미지로 첨부**하여 실제 데이터 밀도를 보고 결정하게 함(PLANNING 10-2). 다크 모드는 미구현이라 라이트만 존재 — 디자인이 다크 시안을 새로 생성.

| # | 라우트 | 뷰포트 | 상태 | 관찰 포인트 |
|---|---|---|---|---|
| 1 | /dashboard | 1280×900 | 2025 연간 | 2-col(Breakdown+Trend), Goal 바, 테이블 밀도 |
| 2 | /dashboard | 375 (mobile) | 2025 연간 | 1-col 스택, 차트 비율 |
| 3 | /input | 1280×900 | 시나리오1 입력 후(125 kWh→57) | 2-col(폼 좌·프리뷰 우), 요약/바/테이블 |
| 4 | /input | 375 (mobile) | 빈 상태 | 폼 스택, disabled 제출, 빈 프리뷰 |
| 5 | /dashboard | ~800 (tablet 폴백) | 2025 연간 | lg 미적용 시 1-col 폴백 확인 |

---

## 8. claude.ai → Claude Code 핸드백 포맷 (디자인에 요청할 산출 형식)

1. **토큰 세트** — Tailwind v4 `@theme` 변수명 형태, **라이트/다크 쌍**. (색·타이포·간격·radius·shadow + 차트용 CSS 변수: 축/그리드/카테고리)
2. **컴포넌트별 className 스니펫** — 위 인벤토리의 **동결 props를 그대로** 사용(새 prop 금지). React+Tailwind.
3. **상태·반응형 시안** — 두 라우트 × {데스크탑/모바일} × {라이트/다크} + 상태(빈/로딩/에러/포커스/검증 에러).
4. **recharts 색** — hex 직접 대신 **CSS 변수명**으로 지정(D3).
5. **D2 결정** — 모바일 테이블 방식 택1 + 시안.

---

## 9. Session 5 통합·검증 체크리스트 (2단계에서 채움)

- [ ] `app/globals.css @theme`에 토큰 정착(라이트/다크) + `@custom-variant dark`
- [ ] 컴포넌트 className 교체 — **로직/props 무변경** 확인
- [ ] `CATEGORY_COLORS`·`ScopeTag` 색을 토큰 참조로
- [ ] 다크 토글 구현(AppNav) + `localStorage` 영속 + prefers-color-scheme 초기값
- [ ] recharts 축/그리드/카테고리 색 토큰화(D3)
- [ ] 모바일 ActivityTable D2 반영
- [ ] 반응형 검증: `preview_resize` 375/768/1280
- [ ] 다크 대비 검증: `preview_resize colorScheme=dark` + `preview_inspect` 대비비
- [ ] `yarn build`/`lint`/`test`(46+) 회귀 0, 콘솔 에러 0
- [ ] SESSION_LOG.md Session 5 갱신

---

## 10. 이슈 로그 (양방향 루프 — 통합 중 발견 사항 기록)

| # | 위치 | 이슈 | 디자인 재요청 | 상태 |
|---|---|---|---|---|
| (비어 있음) | | | | |
