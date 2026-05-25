import type { Metadata } from "next";
import "./globals.css";
import AppNav from "@/components/shared/AppNav";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "HanaLoop PCF Dashboard",
  description: "제품탄소발자국(PCF) 현황 대시보드 — 총량·구성·추세·목표",
};

/**
 * 다크 모드 초기화 스크립트 (D1) — paint 이전에 .dark 클래스를 적용하여
 * 새로고침 시 깜빡임(FOUC)을 방지합니다. 초기값은 localStorage 우선, 없으면
 * prefers-color-scheme. 토글은 AppNav 가 담당합니다.
 */
const THEME_INIT = `
(function(){try{
  var s=localStorage.getItem("theme");
  var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark",d);
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 폰트는 app/globals.css 의 @import 로 로드합니다(여기서 <link> 사용 시
            no-page-custom-font 경고). 아래는 다크 모드 FOUC 방지 스크립트. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppNav />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
