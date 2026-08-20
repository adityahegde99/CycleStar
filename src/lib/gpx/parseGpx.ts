import { gpx } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import type { Feature, LineString } from "geojson";
import type { RawRoute, TrackPoint } from "@/lib/types/track";

function extractTrackPoints(feature: Feature<LineString>): TrackPoint[] {
  return feature.geometry.coordinates.map(([lng, lat, ele]) => ({
    lng,
    lat,
    elevation: ele,
  }));
}

function findLongestLineString(
  features: Feature[]
): Feature<LineString> | null {
  let best: Feature<LineString> | null = null;
  let bestLength = 0;

  for (const feature of features) {
    if (feature.geometry?.type !== "LineString") continue;
    const line = feature as Feature<LineString>;
    const pts = line.geometry.coordinates;
    if (pts.length < 2) continue;

    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      len += distance(
        point([pts[i - 1][0], pts[i - 1][1]]),
        point([pts[i][0], pts[i][1]]),
        { units: "meters" }
      );
    }

    if (len > bestLength) {
      bestLength = len;
      best = line;
    }
  }

  return best;
}

export async function parseGpxFile(file: File): Promise<RawRoute> {
  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const geojson = gpx(doc);

  const line = findLongestLineString(geojson.features);
  if (!line) {
    throw new Error("No route found in GPX file.");
  }

  const points = extractTrackPoints(line);
  if (points.length < 2) {
    throw new Error("GPX route must contain at least two points.");
  }

  const totalDistanceM = points.slice(1).reduce((sum, p, i) => {
    const prev = points[i];
    return (
      sum +
      distance(point([prev.lng, prev.lat]), point([p.lng, p.lat]), {
        units: "meters",
      })
    );
  }, 0);

  return {
    points,
    name: typeof line.properties?.name === "string" ? line.properties.name : undefined,
    totalDistanceM,
  };
}
