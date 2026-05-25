/**
 * UnitLabel — 단위 표기 (표시 전용)
 *
 * kgCO₂e, kWh, kg, ton-km 등 단위를 일관된 스타일로 렌더합니다.
 * 단위 표기 일관성은 체크리스트 필수 항목입니다 (docs/USER_RESEARCH.md 4-2).
 *
 * 표시 전용 — 도메인 로직 없음. 인터랙션이 없으므로 서버 컴포넌트로 유지합니다.
 */

interface UnitLabelProps {
  unit: string;
}

export default function UnitLabel({ unit }: UnitLabelProps) {
  return (
    <span className="font-mono text-xs text-gray-500" aria-label={`단위 ${unit}`}>
      {unit}
    </span>
  );
}
