/**
 * Card — 컨테이너 프리미티브
 *
 * 대시보드/입력 화면의 섹션을 감싸는 기본 컨테이너입니다.
 * 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import type { ReactNode } from "react";

interface CardProps {
  /** 카드 상단 제목 (선택) */
  title?: string;
  /** 제목 우측에 배치할 보조 영역 (예: 기간 필터, 배지) */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({
  title,
  action,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] ${className}`}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
