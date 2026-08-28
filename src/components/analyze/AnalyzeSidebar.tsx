"use client";

import FileDropzone from "@/components/controls/FileDropzone";
import DatePicker from "@/components/controls/DatePicker";
import StartTimeInput from "@/components/controls/StartTimeInput";
import SpeedSlider from "@/components/controls/SpeedSlider";
import DirectionToggle from "@/components/controls/DirectionToggle";
import UnitToggle from "@/components/controls/UnitToggle";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ComparisonBanner from "@/components/dashboard/ComparisonBanner";
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

      <ComparisonBanner comparison={comparison} loading={loading && !!rawRoute} />
      <MetricsCard
        summary={activeAnalysis?.summary ?? null}
        unit={unit}
        loading={loading && !!rawRoute}
      />
    </div>
  );
}
