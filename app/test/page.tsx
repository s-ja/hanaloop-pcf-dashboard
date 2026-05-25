"use client";

/**
 * 임시 검증 라우트 — Session 2 공유 컴포넌트/유틸 렌더 확인용
 *
 * ⚠️ 임시 페이지입니다. Session 3·4 통합 시 제거 예정.
 *    (SESSION_LOG.md Session 2 항목에 명시)
 *
 * 목적: 6개 컴포넌트(ScopeTag, UnitLabel, EmissionFactorBadge, PeriodFilter,
 *       Button, Card)를 샘플 props 로 렌더링하고 콘솔 에러 없이 표시되는지 확인.
 *       더불어 lib/format, lib/validators 의 대표 출력을 함께 노출합니다.
 *
 * PeriodFilter 의 selected 상태를 보유하기 위해 클라이언트 컴포넌트입니다.
 */

import { useState } from "react";

import type { EmissionScope } from "@/types";
import { EMISSION_FACTORS } from "@/lib/constants";
import {
  formatEmission,
  formatNumber,
  formatPercentChange,
  formatPeriodLabel,
} from "@/lib/format";
import { validateActivityInput } from "@/lib/validators";

import ScopeTag from "@/components/shared/ScopeTag";
import UnitLabel from "@/components/shared/UnitLabel";
import EmissionFactorBadge from "@/components/shared/EmissionFactorBadge";
import PeriodFilter from "@/components/shared/PeriodFilter";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const ALL_SCOPES: EmissionScope[] = [
  "scope1",
  "scope2",
  "scope3_upstream",
  "scope3_downstream",
];

const SAMPLE_UNITS = ["kgCO₂e", "kWh", "kg", "ton-km"];

export default function TestPage() {
  const [period, setPeriod] = useState("2025-05");

  // validators 데모 — 의도적으로 잘못된 입력(음수 amount, 단위 불일치, 미지의 배출원)
  const invalidErrors = validateActivityInput({
    category: "electricity",
    description: "알 수 없는 발전소",
    date: "2025-13-40",
    amount: -10,
    unit: "kg",
  });
  const validErrors = validateActivityInput({
    category: "electricity",
    description: "한국전력",
    date: "2025-05-01",
    amount: 120,
    unit: "kWh",
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 ring-1 ring-yellow-200">
        ⚠️ 임시 검증 페이지입니다. 통합 세션에서 제거됩니다.
      </div>

      <Card title="ScopeTag — 4개 Scope 전부">
        <div className="flex flex-wrap gap-2">
          {ALL_SCOPES.map((scope) => (
            <ScopeTag key={scope} scope={scope} />
          ))}
        </div>
      </Card>

      <Card title="UnitLabel — 단위 표기">
        <div className="flex flex-wrap items-center gap-4">
          {SAMPLE_UNITS.map((unit) => (
            <UnitLabel key={unit} unit={unit} />
          ))}
        </div>
      </Card>

      <Card title="EmissionFactorBadge — 배출계수 마스터 전체">
        <div className="flex flex-wrap gap-2">
          {EMISSION_FACTORS.map((ef) => (
            <EmissionFactorBadge
              key={ef.id}
              version={ef.version}
              source={ef.source}
              validFrom={ef.validFrom}
            />
          ))}
        </div>
      </Card>

      <Card
        title="PeriodFilter — 기간 선택"
        action={<PeriodFilter selected={period} onChange={setPeriod} />}
      >
        <p className="text-sm text-gray-600">
          선택된 기간: <strong>{formatPeriodLabel(period)}</strong> (식별자:{" "}
          <code>{period}</code>)
        </p>
      </Card>

      <Card title="Button — variant / size">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Card>

      <Card title="lib/format — 포매팅 출력">
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            formatNumber(2210.076) → <strong>{formatNumber(2210.076)}</strong>
          </li>
          <li>
            formatEmission(2210.076) →{" "}
            <strong>{formatEmission(2210.076)}</strong>
          </li>
          <li>
            formatPeriodLabel(&quot;2025-05&quot;) →{" "}
            <strong>{formatPeriodLabel("2025-05")}</strong>
          </li>
          <li>
            formatPeriodLabel(&quot;2025&quot;) →{" "}
            <strong>{formatPeriodLabel("2025")}</strong>
          </li>
          <li>
            formatPercentChange(108, 100) →{" "}
            <strong>{formatPercentChange(108, 100)}</strong>
          </li>
          <li>
            formatPercentChange(92, 100) →{" "}
            <strong>{formatPercentChange(92, 100)}</strong>
          </li>
        </ul>
      </Card>

      <Card title="lib/validators — 검증 결과">
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <p className="font-medium">정상 입력 → 오류 없음:</p>
            <pre className="mt-1 rounded bg-gray-50 p-2 text-xs">
              {JSON.stringify(validErrors, null, 2)}
            </pre>
          </div>
          <div>
            <p className="font-medium">오류 입력 → 필드별 메시지:</p>
            <pre className="mt-1 rounded bg-gray-50 p-2 text-xs">
              {JSON.stringify(invalidErrors, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </main>
  );
}
