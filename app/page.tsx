/**
 * / — 루트 진입점
 *
 * 본 과제의 기본 진입 화면은 경영자 중심 대시보드이므로 /dashboard 로
 * 리다이렉트합니다 (docs/PLANNING.md 3 디렉토리 구조). 입력 화면(/input)은
 * Session 4 에서 추가됩니다.
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
