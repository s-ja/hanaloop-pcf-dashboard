"use client";

/**
 * AppNav — 라우트 내비게이션 (표시 전용)
 *
 * 두 페르소나 뷰(/dashboard ↔ /input) 간 이동 수단입니다
 * (docs/USER_RESEARCH.md 5장 뷰 라우트 분리). 현재 경로를 강조하여 위치를
 * 알려 줍니다. usePathname 을 사용하므로 클라이언트 컴포넌트입니다.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/input", label: "데이터 입력" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm font-bold text-gray-900">
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
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sky-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
