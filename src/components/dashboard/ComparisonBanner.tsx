"use client";

import { ArrowRight, Minus, Sun } from "lucide-react";
import type { DirectionComparison } from "@/lib/types/wind";

interface ComparisonBannerProps {
  comparison: DirectionComparison | null;
  loading?: boolean;
}

export default function ComparisonBanner({
  comparison,
  loading,
}: ComparisonBannerProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <div className="h-4 w-full rounded bg-zinc-800" />
      </div>
    );
  }

  if (!comparison) return null;

  const { recommendation, bannerText, sunText, sunAltText } = comparison;
  const isNeutral = recommendation === "neutral";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isNeutral
          ? "border-zinc-700 bg-zinc-900/80"
          : "border-emerald-500/50 bg-emerald-500/10"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {isNeutral ? (
          <Minus className="h-4 w-4 text-zinc-400" />
        ) : (
          <ArrowRight className="h-4 w-4 text-emerald-400" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Recommendation
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-100">{bannerText}</p>
      <div className="mt-3 border-t border-zinc-700/80 pt-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Sun and shade
          </span>
        </div>
        <p className="text-sm leading-relaxed text-amber-100/90">{sunText}</p>
        {sunAltText && (
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
            {sunAltText}
          </p>
        )}
      </div>
    </div>
  );
}
