import dynamic from "next/dynamic";
import type { RouteLeg } from "@/lib/routing/snapToRoads";
import type { MapFocus } from "@/lib/types/map";
import type { TrackPoint } from "@/lib/types/track";

const DrawMapInner = dynamic(() => import("./DrawMapInner"), {
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

interface DrawMapProps {
  waypoints: TrackPoint[];
  legs: RouteLeg[];
  onMapClick: (point: TrackPoint) => void;
  focus: MapFocus | null;
}

export default function DrawMap(props: DrawMapProps) {
  return <DrawMapInner {...props} />;
}
