/**
 * baseline 스크린샷 캡처 스크립트 (Session 5 디자인 핸드오프용)
 *
 * docs/DESIGN_HANDOFF.md 7장 baseline 세트를 docs/design/baseline/*.png 로 생성합니다.
 * 핸드오프(claude.ai 디자인 첨부) + Session 5 통합의 before/after 회귀 캡처에 재사용합니다.
 *
 * 사용법:
 *   1) 의존성: yarn add -D playwright  (이미 설치됨) + npx playwright install chromium
 *   2) 앱 실행: yarn dev  (또는 yarn build && yarn start) — 기본 http://localhost:3000
 *   3) 캡처:   node scripts/capture-baseline.mjs
 *      - 다른 포트면: BASE_URL=http://localhost:3001 node scripts/capture-baseline.mjs
 *
 * 다크 모드 메모: 다크는 Session 5 구현 후 의미가 생깁니다. CAPTURE_DARK=1 로 켜면
 * colorScheme=dark 변형(*-dark.png)도 추가 캡처합니다(구현 전에는 라이트와 동일하게 보임).
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "docs/design/baseline";
const CAPTURE_DARK = process.env.CAPTURE_DARK === "1";

mkdirSync(OUT, { recursive: true });

/** 단순 이동만 하면 되는 정적 화면들 */
const STATIC_SHOTS = [
  { name: "dashboard-desktop-1280", path: "/dashboard", w: 1280, h: 900 },
  { name: "dashboard-tablet-800", path: "/dashboard", w: 800, h: 1000 },
  { name: "dashboard-mobile-375", path: "/dashboard", w: 375, h: 812 },
  { name: "input-mobile-375", path: "/input", w: 375, h: 812 },
];

const schemes = CAPTURE_DARK ? ["light", "dark"] : ["light"];

const browser = await chromium.launch();

const suffix = (scheme) => (scheme === "dark" ? "-dark" : "");

for (const scheme of schemes) {
  for (const s of STATIC_SHOTS) {
    const page = await browser.newPage({
      viewport: { width: s.w, height: s.h },
      colorScheme: scheme,
    });
    await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600); // recharts 애니메이션 안정화
    await page.screenshot({ path: `${OUT}/${s.name}${suffix(scheme)}.png`, fullPage: true });
    await page.close();
  }

  // /input — 시나리오 1 입력 후 프리뷰 상태 (데스크탑)
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    colorScheme: scheme,
  });
  await page.goto(`${BASE}/input`, { waitUntil: "networkidle" });
  await page.selectOption('select:has(option[value="electricity"])', "electricity");
  await page.selectOption('select:has(option[value="한국전력"])', "한국전력");
  await page.fill('input[type="date"]', "2025-09-01");
  await page.fill('input[type="number"]', "125");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(700); // 프리뷰 차트 안정화
  await page.screenshot({ path: `${OUT}/input-desktop-1280${suffix(scheme)}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(`baseline 캡처 완료 → ${OUT} (schemes: ${schemes.join(", ")})`);
