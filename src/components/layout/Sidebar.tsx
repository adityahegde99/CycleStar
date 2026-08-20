"use client";

import { Wind, Shield } from "lucide-react";
import FileDropzone from "@/components/controls/FileDropzone";
import DatePicker from "@/components/controls/DatePicker";
import TimeSlider from "@/components/controls/TimeSlider";
import SpeedSlider from "@/components/controls/SpeedSlider";
import DirectionToggle from "@/components/controls/DirectionToggle";
import UnitToggle from "@/components/controls/UnitToggle";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ComparisonBanner from "@/components/dashboard/ComparisonBanner";
import type { useWindAnalysis } from "@/hooks/useWindAnalysis";

type SidebarProps = ReturnType<typeof useWindAnalysis>;

export default function Sidebar(props: SidebarProps) {
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

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5">
        <div className="flex items-center gap-2">
          <Wind className="h-6 w-6 text-emerald-500" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-50">
              VeloWind
            </h1>
            <p className="text-xs text-zinc-500">
              Clockwise or counter-clockwise?
            </p>
          </div>
        </div>
      </div>

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
          <TimeSlider value={startMinutes} onChange={setStartMinutes} />
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

        <ComparisonBanner comparison={comparison} loading={loading && !!rawRoute} />
        <MetricsCard
          summary={activeAnalysis?.summary ?? null}
          unit={unit}
          loading={loading && !!rawRoute}
        />

        <div className="mt-auto flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            Your GPX never leaves this device. Only coordinates are sent to
            Open-Meteo for weather forecasts.
          </p>
        </div>
      </div>
    </aside>
  );
}
