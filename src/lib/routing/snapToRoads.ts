import type { TrackPoint } from "@/lib/types/track";

// FOSSGIS runs this OSRM instance with a bicycle profile for openstreetmap.org.
// It needs no API key and sends permissive CORS headers. The "driving" path
// segment is just OSRM's fixed URL shape; the deployed profile is the bike one.
const OSRM_BIKE_URL =
  "https://routing.openstreetmap.de/routed-bike/route/v1/driving";

export interface RouteLeg {
  points: TrackPoint[];
  snapped: boolean;
}

interface OsrmResponse {
  code: string;
  routes?: {
    distance: number;
    geometry: { coordinates: [number, number][] };
  }[];
}

function straightLeg(from: TrackPoint, to: TrackPoint): RouteLeg {
  return { points: [from, to], snapped: false };
}

/**
 * Snaps a single leg to the cycling network. Falls back to a straight line when
 * the router is unreachable so the drawing tool keeps working offline.
 */
export async function routeLeg(
  from: TrackPoint,
  to: TrackPoint,
  signal?: AbortSignal
): Promise<RouteLeg> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM_BIKE_URL}/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return straightLeg(from, to);

    const data: OsrmResponse = await response.json();
    const geometry = data.routes?.[0]?.geometry;
    if (data.code !== "Ok" || !geometry?.coordinates?.length) {
      return straightLeg(from, to);
    }

    return {
      points: geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      snapped: true,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return straightLeg(from, to);
  }
}
