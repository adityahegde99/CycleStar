import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import type { RawRoute } from "@/lib/types/track";

export function computeRouteBbox(
  route: RawRoute
): [number, number, number, number] {
  const coords = route.points.map((p) => [p.lng, p.lat] as [number, number]);
  const [minLng, minLat, maxLng, maxLat] = bbox(lineString(coords));
  return [minLat, minLng, maxLat, maxLng];
}

export function computeRouteMidpoint(route: RawRoute): {
  lat: number;
  lng: number;
} {
  const points = route.points;
  const mid = points[Math.floor(points.length / 2)];
  return { lat: mid.lat, lng: mid.lng };
}
