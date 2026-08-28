import dynamic from "next/dynamic";
import type { RouteLeg } from "@/lib/routing/snapToRoads";
import type { MapFocus } from "@/lib/types/map";
import type { TrackPoint } from "@/lib/types/track";

const DrawMapInner = dynamic(() => import("./DrawMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
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
