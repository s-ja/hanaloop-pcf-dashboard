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
  primary: "bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-300",
  secondary:
    "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 disabled:text-gray-400",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}
