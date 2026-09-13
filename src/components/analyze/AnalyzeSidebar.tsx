"use client";

import { useCallback, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import FileDropzone from "@/components/controls/FileDropzone";
import DatePicker from "@/components/controls/DatePicker";
import StartTimeInput from "@/components/controls/StartTimeInput";
import SpeedSlider from "@/components/controls/SpeedSlider";
import DirectionToggle from "@/components/controls/DirectionToggle";
import UnitToggle from "@/components/controls/UnitToggle";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ComparisonBanner from "@/components/dashboard/ComparisonBanner";
import {
  copySummaryToClipboard,
  shareRouteSummary,
} from "@/lib/share/routeSummary";
import type { useWindAnalysis } from "@/hooks/useWindAnalysis";

type AnalyzeSidebarProps = ReturnType<typeof useWindAnalysis>;

export default function AnalyzeSidebar(props: AnalyzeSidebarProps) {
  const {
    routeName,
    rideDate,
    setRideDate,
    startMinutes,
    setStartMinutes,
    averageSpeed,
    setAverageSpeed,
    unit,
    setUnit,
    direction,
    setDirection,
    comparison,
    activeAnalysis,
    loading,
    parsing,
    error,
    handleFileUpload,
    rawRoute,
  } = props;

  const [shareBusy, setShareBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const canShareSummary = !!activeAnalysis && !loading;

  const handleCopySummary = useCallback(async () => {
    const el = document.getElementById("analysis-summary");
    if (!el) return;

    setShareBusy(true);
    setShareMessage(null);
    try {
      await copySummaryToClipboard(el);
      setShareMessage("Copied summary image to clipboard.");
    } catch (err) {
      setShareMessage(
        err instanceof Error ? err.message : "Could not copy the summary image."
      );
    } finally {
      setShareBusy(false);
    }
  }, []);

  const handleShareSummary = useCallback(async () => {
    const el = document.getElementById("analysis-summary");
    if (!el) return;

    const title = routeName?.trim() || "CycleStar route";
    setShareBusy(true);
    setShareMessage(null);
    try {
      await shareRouteSummary(el, {
        title,
        text: "Wind analysis from CycleStar",
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setShareMessage(
        err instanceof Error ? err.message : "Could not share the summary image."
      );
    } finally {
      setShareBusy(false);
    }
  }, [routeName]);

  return (
    <div className="flex flex-1 flex-col gap-5 p-5">
      <FileDropzone
        onFile={handleFileUpload}
        parsing={parsing}
        routeName={routeName}
      />

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <DatePicker value={rideDate} onChange={setRideDate} />
        <StartTimeInput value={startMinutes} onChange={setStartMinutes} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Units</span>
            <UnitToggle value={unit} onChange={setUnit} />
          </div>
          <SpeedSlider
            value={averageSpeed}
            unit={unit}
            onChange={setAverageSpeed}
          />
        </div>
        <DirectionToggle
          value={direction}
          onChange={setDirection}
          disabled={!rawRoute}
        />
      </div>

      <div id="analysis-summary" className="space-y-5">
        <ComparisonBanner
          comparison={comparison}
          loading={loading && !!rawRoute && !comparison}
        />
        <MetricsCard
          summary={activeAnalysis?.summary ?? null}
          glare={activeAnalysis?.glare ?? null}
          unit={unit}
          loading={loading && !!rawRoute && !activeAnalysis}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopySummary}
          disabled={!canShareSummary || shareBusy}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy image
        </button>
        <button
          type="button"
          onClick={handleShareSummary}
          disabled={!canShareSummary || shareBusy}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
      {shareMessage && (
        <p className="text-xs text-zinc-500">{shareMessage}</p>
      )}
    </div>
  );
}
