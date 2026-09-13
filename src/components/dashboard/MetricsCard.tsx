"use client";

import { formatDistance, formatSpeed } from "@/lib/constants";
import type { SpeedUnit } from "@/lib/types/weather";
import type { GlareSummary, RouteWindSummary } from "@/lib/types/wind";

interface MetricsCardProps {
  summary: RouteWindSummary | null;
  glare?: GlareSummary | null;
  unit: SpeedUnit;
  loading?: boolean;
}

function MetricRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-cs-muted">
        {color && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="text-sm font-semibold text-cs-text">{value}</span>
    </div>
  );
}

export default function MetricsCard({
  summary,
  glare,
  unit,
  loading,
}: MetricsCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 rounded-xl border border-cs-border bg-cs-card p-4">
        <div className="h-4 w-24 rounded bg-cs-chip" />
        <div className="h-3 w-full rounded bg-cs-chip" />
        <div className="h-3 w-full rounded bg-cs-chip" />
        <div className="h-3 w-3/4 rounded bg-cs-chip" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-cs-border bg-cs-card p-4">
        <h3 className="mb-2 text-sm font-semibold text-cs-text">Metrics</h3>
        <p className="text-sm text-cs-subtle">Upload a GPX to see wind metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-cs-border bg-cs-card p-4">
      <h3 className="text-sm font-semibold text-cs-text">Metrics</h3>
      <MetricRow
        label="Total Distance"
        value={formatDistance(summary.totalDistanceM, unit)}
      />
      <MetricRow
        label="Headwind"
        value={`${summary.headwindPercent.toFixed(0)}%`}
        color="#ef4444"
      />
      <MetricRow
        label="Crosswind"
        value={`${summary.crosswindPercent.toFixed(0)}%`}
        color="#eab308"
      />
      <MetricRow
        label="Tailwind"
        value={`${summary.tailwindPercent.toFixed(0)}%`}
        color="#22c55e"
      />
      <MetricRow
        label="Avg Headwind"
        value={formatSpeed(summary.avgHeadwindSpeed, unit)}
      />
      <MetricRow
        label="Sun in eyes"
        value={
          glare && glare.totalGlareDistance > 0
            ? `${formatDistance(glare.totalGlareDistance, unit)} (${glare.glarePercent.toFixed(0)}%)`
            : "None"
        }
        color="#fbbf24"
      />

      <div className="mt-2 flex h-2 overflow-hidden rounded-full">
        <div
          className="bg-red-500"
          style={{ width: `${summary.headwindPercent}%` }}
        />
        <div
          className="bg-yellow-500"
          style={{ width: `${summary.crosswindPercent}%` }}
        />
        <div
          className="bg-green-500"
          style={{ width: `${summary.tailwindPercent}%` }}
        />
      </div>
    </div>
  );
}
