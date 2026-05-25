"use client";

/**
 * AppNav — 라우트 내비게이션 + 다크 모드 토글 (표시 전용)
 *
 * 두 페르소나 뷰(/dashboard ↔ /input) 간 이동 수단입니다
 * (docs/USER_RESEARCH.md 5장 뷰 라우트 분리). 현재 경로를 강조하여 위치를
 * 알려 줍니다. usePathname 을 사용하므로 클라이언트 컴포넌트입니다.
 *
 * 다크 모드(D1, docs/DESIGN_HANDOFF.md): 우측 아이콘 버튼으로 수동 토글합니다.
 *   - 초기값은 app/layout.tsx 의 인라인 스크립트가 paint 이전에 적용(.dark 클래스).
 *     본 컴포넌트는 mount 시 현재 적용 상태를 읽어 토글 상태와 동기화합니다.
 *   - 토글 시 <html>.dark 를 갱신하고 localStorage 에 영속합니다.
 *   - 신규 런타임 패키지 없이 자체 구현.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/input", label: "데이터 입력" },
];

type Theme = "light" | "dark";

/**
 * 테마 상태는 <html>.dark 클래스(외부 시스템)가 단일 출처입니다. layout.tsx 의
 * 인라인 스크립트가 paint 이전에 설정한 값을 useSyncExternalStore 로 읽어
 * SSR/하이드레이션 불일치 없이 동기화합니다(setState-in-effect 회피).
 */
const THEME_EVENT = "pcf:themechange";

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}
function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function getServerSnapshot(): Theme {
  return "light";
}

export default function AppNav() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 토글은 세션 한정으로 동작.
    }
    // 외부 시스템(DOM) 변경을 구독자(본 컴포넌트)에게 알려 재렌더링합니다.
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const isDark = theme === "dark";

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm font-bold tracking-tight text-fg">
          HanaLoop PCF
        </span>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-fg"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-fg-muted hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)]"
          >
            {isDark ? (
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="10" cy="10" r="3.2" />
                <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.4 4.4l1.1 1.1M14.5 14.5l1.1 1.1M4.4 15.6l1.1-1.1M14.5 5.5l1.1-1.1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5 6.5 6.5 0 1 0 15.5 12.6Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
