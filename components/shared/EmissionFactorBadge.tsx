/**
 * EmissionFactorBadge — 사용된 배출계수의 출처·버전·유효시점 배지 (표시 전용)
 *
 * 실무자가 "어떤 계수 버전을 사용했는가"를 추적할 수 있도록 노출합니다
 * (docs/USER_RESEARCH.md 4-1, docs/DOMAIN.md 2-3 배출계수 버전 관리).
 *
 * 표시 전용 — 도메인 로직 없음. 필요한 필드(version/source/validFrom)만 분해해
 * 받습니다. 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

import { formatPeriodLabel } from "@/lib/format";

interface EmissionFactorBadgeProps {
  version: string;
  source: string;
  validFrom: string;
}

export default function EmissionFactorBadge({
  version,
  source,
  validFrom,
}: EmissionFactorBadgeProps) {
  return (
    <span
      title={`출처: ${source} · 버전: ${version} · 유효 시작: ${validFrom}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg-muted"
    >
      {/* 🏷️ 이모지 → 인라인 SVG (다크 모드 색·폰트 폴백 영향 제거) */}
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        width="11"
        height="11"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M6.5 1.5h3a1 1 0 0 1 1 1v3a1 1 0 0 1-.29.71l-4.5 4.5a1 1 0 0 1-1.42 0L1.79 7.21a1 1 0 0 1 0-1.42l4.5-4.5a1 1 0 0 1 .21-.29Z"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="8.25" cy="3.75" r="0.75" fill="currentColor" />
      </svg>
      <span className="font-medium text-fg">{source}</span>
      <span className="text-fg-faint">·</span>
      <span className="font-mono">{version}</span>
      <span className="text-fg-faint">·</span>
      <span>{`${formatPeriodLabel(validFrom.slice(0, 7))}~`}</span>
    </span>
  );
}
