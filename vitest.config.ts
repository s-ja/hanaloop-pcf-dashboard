import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest 설정
 *
 * tsconfig.json 의 경로 별칭 '@/*' → 프로젝트 루트 를 테스트 환경에서도 동일하게
 * 해석하도록 alias 를 맞춥니다. (lib/* 파일이 '@/types' 를 import 하므로 필요)
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
