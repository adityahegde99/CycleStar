import distance from "@turf/distance";
import { point } from "@turf/helpers";
import type { RawRoute, TrackPoint } from "@/lib/types/track";

export function measurePathMeters(points: TrackPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    total += distance(
      point([prev.lng, prev.lat]),
      point([curr.lng, curr.lat]),
      { units: "meters" }
    );
  }
  return total;
}

export function toRawRoute(points: TrackPoint[], name?: string): RawRoute {
  return {
    points,
    name,
    totalDistanceM: measurePathMeters(points),
  };
}
