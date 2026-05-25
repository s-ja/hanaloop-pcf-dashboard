# HanaLoop PCF Dashboard — Claude Code 운영 규칙

## 필수 선행 작업

세션 시작 시 반드시 아래 순서로 읽어라:

1. docs/PLANNING.md
2. docs/DOMAIN.md
3. docs/USER_RESEARCH.md
4. SESSION_LOG.md ← 현재 진행 상태 파악

## 불변 제약 (전 세션 공통)

- types/index.ts는 Session 1 확정 후 수정 금지
- 배출계수는 반드시 lib/constants.ts의 EMISSION_FACTORS에서만 import
- 계산 로직은 컴포넌트 내부에 작성 금지 — lib/pcf-calculator.ts 사용
- 패키지 매니저는 yarn만 사용 (npm 명령어 금지)
- yarn start 기준으로 동작 확인

## 세션 종료 시 필수 작업

## 작업 완료 후 SESSION_LOG.md를 아래 형식으로 업데이트하라:

## Session N 완료 (YYYY-MM-DD)

- 완료 파일: [목록]
- 검증 결과: [완료 조건 달성 여부]
- 다음 세션 주의사항: [발견한 이슈나 의존성]

---

## 코드 컨벤션

- 단위 표기: kgCO₂e 통일
- 컴포넌트 props: 큰 객체보다 필요한 필드만 분해
- 상태는 페이지 레벨로 끌어올림 (Lift State Up)
