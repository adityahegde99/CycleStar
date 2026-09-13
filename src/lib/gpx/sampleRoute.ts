import along from "@turf/along";
import bearing from "@turf/bearing";
import distance from "@turf/distance";
import { lineString, point } from "@turf/helpers";
import length from "@turf/length";
import { SEGMENT_LENGTH_M } from "@/lib/constants";
import { flipBearing } from "@/lib/spatial/bearings";
import type { GPXSegment } from "@/lib/types/segment";
import type { RawRoute, TrackPoint } from "@/lib/types/track";

function toTurfPoint(p: TrackPoint) {
  return point([p.lng, p.lat]);
}

function interpolatePoint(
  line: ReturnType<typeof lineString>,
  distKm: number
): TrackPoint {
  const pt = along(line, distKm, { units: "kilometers" });
  const [lng, lat] = pt.geometry.coordinates;
  return { lng, lat };
}

export function sampleRouteSegments(
  route: RawRoute,
  segmentLengthM: number = SEGMENT_LENGTH_M
): GPXSegment[] {
  const orderedPoints = route.points;
  const coords = orderedPoints.map((p) => [p.lng, p.lat] as [number, number]);
  const line = lineString(coords);
  const totalKm = length(line, { units: "kilometers" });
  const totalM = totalKm * 1000;

  if (totalM < segmentLengthM) {
    const start = orderedPoints[0];
    const end = orderedPoints[orderedPoints.length - 1];
    const riderBearingDeg = bearing(toTurfPoint(start), toTurfPoint(end));
    return [
      {
        index: 0,
        start,
        end,
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        distanceM: totalM,
        cumulativeDistanceM: 0,
        riderBearingDeg: riderBearingDeg < 0 ? riderBearingDeg + 360 : riderBearingDeg,
        estimatedArrival: new Date(),
      },
    ];
  }

  const cutDistancesM: number[] = [0];
  for (let d = segmentLengthM; d < totalM; d += segmentLengthM) {
    cutDistancesM.push(d);
  }
  if (cutDistancesM[cutDistancesM.length - 1] !== totalM) {
    cutDistancesM.push(totalM);
  }

  const cutPoints = cutDistancesM.map((d) =>
    interpolatePoint(line, d / 1000)
  );

  const segments: GPXSegment[] = [];
  for (let i = 0; i < cutPoints.length - 1; i++) {
    const start = cutPoints[i];
    const end = cutPoints[i + 1];
    const segDist = distance(toTurfPoint(start), toTurfPoint(end), {
      units: "meters",
    });
    const cumulativeDistanceM = cutDistancesM[i];
    let riderBearingDeg = bearing(toTurfPoint(start), toTurfPoint(end));
    if (riderBearingDeg < 0) riderBearingDeg += 360;

    segments.push({
      index: i,
      start,
      end,
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      distanceM: segDist,
      cumulativeDistanceM,
      riderBearingDeg,
      estimatedArrival: new Date(),
    });
  }

  return segments;
}

/** Ride the opposite way on the same sampled geometry so the drawn path never shifts. */
export function orientSegmentsForDirection(
  segments: GPXSegment[],
  reverse: boolean
): GPXSegment[] {
  if (!reverse) {
    return segments.map((seg, index) => ({ ...seg, index }));
  }

  const totalM = segments.reduce((sum, seg) => sum + seg.distanceM, 0);
  return segments.map((seg, index) => ({
    ...seg,
    index,
    riderBearingDeg: flipBearing(seg.riderBearingDeg),
    cumulativeDistanceM: totalM - seg.cumulativeDistanceM - seg.distanceM,
  }));
}
