import dynamic from "next/dynamic";
import type { SpeedUnit } from "@/lib/types/weather";
import type { WindAnalysisResult } from "@/lib/types/wind";

const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-cs-bg">
      <div className="flex flex-col items-center gap-3 text-cs-subtle">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cs-border border-t-emerald-500" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

interface RouteMapProps {
  analysis: WindAnalysisResult | null;
  unit: SpeedUnit;
}

export default function RouteMap({ analysis, unit }: RouteMapProps) {
  return <RouteMapInner analysis={analysis} unit={unit} />;
}
