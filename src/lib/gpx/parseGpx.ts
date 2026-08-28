import { gpx } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { Feature, LineString } from "geojson";
import { measurePathMeters, toRawRoute } from "@/lib/gpx/buildRoute";
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

    const len = measurePathMeters(
      pts.map(([lng, lat]) => ({ lng, lat }))
    );

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

  return toRawRoute(
    points,
    typeof line.properties?.name === "string" ? line.properties.name : undefined
  );
}
