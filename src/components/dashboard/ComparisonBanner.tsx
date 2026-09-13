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
      <div className="animate-pulse rounded-xl border border-cs-border bg-cs-card p-4">
        <div className="h-4 w-full rounded bg-cs-chip" />
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
          ? "border-cs-border bg-cs-card"
          : "border-emerald-500/50 bg-emerald-500/10"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {isNeutral ? (
          <Minus className="h-4 w-4 text-cs-muted" />
        ) : (
          <ArrowRight className="h-4 w-4 text-emerald-400" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wide text-cs-muted">
          Recommendation
        </span>
      </div>
      <p className="text-sm leading-relaxed text-cs-text">{bannerText}</p>
      <div className="mt-3 border-t border-cs-border pt-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-cs-muted">
            Sun and shade
          </span>
        </div>
        <p className="text-sm leading-relaxed text-cs-text">{sunText}</p>
        {sunAltText && (
          <p className="mt-1.5 text-xs leading-relaxed text-cs-muted">
            {sunAltText}
          </p>
        )}
      </div>
    </div>
  );
}
