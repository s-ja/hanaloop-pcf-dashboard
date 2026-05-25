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
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
    >
      <span aria-hidden>🏷️</span>
      <span className="font-medium text-gray-800">{source}</span>
      <span className="text-gray-400">·</span>
      <span className="font-mono">{version}</span>
      <span className="text-gray-400">·</span>
      <span>{`${formatPeriodLabel(validFrom.slice(0, 7))}~`}</span>
    </span>
  );
}
