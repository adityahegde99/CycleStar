"use client";

import { formatDistance, formatSpeed } from "@/lib/constants";
import type { SpeedUnit } from "@/lib/types/weather";
import type { RouteWindSummary } from "@/lib/types/wind";

interface MetricsCardProps {
  summary: RouteWindSummary | null;
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
      <span className="flex items-center gap-2 text-sm text-zinc-400">
        {color && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

export default function MetricsCard({ summary, unit, loading }: MetricsCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-3/4 rounded bg-zinc-800" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">Metrics</h3>
        <p className="text-sm text-zinc-500">Upload a GPX to see wind metrics.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-300">Metrics</h3>
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
