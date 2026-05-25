"use client";

/**
 * Button — 공통 버튼 프리미티브
 *
 * variant/size 정도의 최소 변형만 둡니다. 과한 디자인은 디자인 세션에서 다룹니다.
 * onClick 등 인터랙션을 받으므로 클라이언트 컴포넌트입니다.
 */

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover disabled:bg-primary/40 disabled:text-primary-fg/70",
  secondary:
    "bg-surface text-fg border border-border-strong hover:bg-surface-2 disabled:text-fg-faint",
  ghost:
    "bg-transparent text-fg-muted hover:bg-surface-2 hover:text-fg disabled:text-fg-faint",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}
