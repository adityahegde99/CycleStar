import * as SunCalc from "suncalc";
import { acuteAngleDeg, signedAngleDeg } from "@/lib/spatial/bearings";
import type { GPXSegment, SunExposureKind } from "@/lib/types/segment";
import type { GlareStretch, GlareSummary } from "@/lib/types/wind";

const GLARE_ALTITUDE_MIN_DEG = 5;
const GLARE_ALTITUDE_MAX_DEG = 25;
const GLARE_BEARING_MAX_DEG = 20;
const AHEAD_MAX_DEG = 35;
const BEHIND_MIN_DEG = 145;
const OVERHEAD_ALTITUDE_DEG = 40;

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** SunCalc azimuth is radians from south; turf bearings are degrees from north. */
function sunAzimuthToCompassDeg(azimuthRad: number): number {
  return (radToDeg(azimuthRad) + 180 + 360) % 360;
}

export function classifySunExposure(
  sunAltitude: number,
  riderBearingDeg: number,
  sunAzimuth: number
): SunExposureKind {
  if (sunAltitude < 0) return "below-horizon";
  if (sunAltitude > OVERHEAD_ALTITUDE_DEG) return "overhead";

  const relative = signedAngleDeg(riderBearingDeg, sunAzimuth);
  const absRel = Math.abs(relative);
  if (absRel <= AHEAD_MAX_DEG) return "in-eyes";
  if (absRel >= BEHIND_MIN_DEG) return "behind";
  return relative > 0 ? "right" : "left";
}

export function enrichSegmentGlare(segment: GPXSegment): GPXSegment {
  const lat = (segment.start.lat + segment.end.lat) / 2;
  const lon = (segment.start.lng + segment.end.lng) / 2;
  const position = SunCalc.getPosition(segment.estimatedArrival, lat, lon);
  const sunAltitude = radToDeg(position.altitude);
  const sunAzimuth = sunAzimuthToCompassDeg(position.azimuth);
  const sunExposure = classifySunExposure(
    sunAltitude,
    segment.riderBearingDeg,
    sunAzimuth
  );
  const lowSun =
    sunAltitude >= GLARE_ALTITUDE_MIN_DEG &&
    sunAltitude <= GLARE_ALTITUDE_MAX_DEG;
  const isHighGlare =
    lowSun &&
    acuteAngleDeg(segment.riderBearingDeg, sunAzimuth) <= GLARE_BEARING_MAX_DEG;

  return {
    ...segment,
    sunAzimuth,
    sunAltitude,
    isHighGlare,
    sunExposure,
  };
}

function clusterGlareStretches(segments: GPXSegment[]): GlareStretch[] {
  const stretches: GlareStretch[] = [];
  let current: GlareStretch | null = null;

  for (const seg of segments) {
    if (!seg.isHighGlare) {
      if (current) stretches.push(current);
      current = null;
      continue;
    }

    const startM = seg.cumulativeDistanceM;
    const endM = seg.cumulativeDistanceM + seg.distanceM;
    if (!current) {
      current = {
        startDistanceM: startM,
        endDistanceM: endM,
        startTime: seg.estimatedArrival,
        endTime: seg.estimatedArrival,
      };
    } else {
      current.endDistanceM = endM;
      current.endTime = seg.estimatedArrival;
    }
  }

  if (current) stretches.push(current);
  return stretches;
}

function dominantExposure(
  counts: Record<SunExposureKind, number>
): SunExposureKind {
  let best: SunExposureKind = "overhead";
  let max = -1;
  for (const key of Object.keys(counts) as SunExposureKind[]) {
    if (counts[key] > max) {
      max = counts[key];
      best = key;
    }
  }
  return best;
}

export function summarizeGlare(segments: GPXSegment[]): GlareSummary {
  const highGlareSegments = segments.filter((seg) => seg.isHighGlare);
  const totalGlareDistance = highGlareSegments.reduce(
    (sum, seg) => sum + seg.distanceM,
    0
  );
  const totalM = segments.reduce((sum, seg) => sum + seg.distanceM, 0);
  const pct = (n: number) => (totalM > 0 ? (n / totalM) * 100 : 0);

  const counts: Record<SunExposureKind, number> = {
    "in-eyes": 0,
    behind: 0,
    left: 0,
    right: 0,
    overhead: 0,
    "below-horizon": 0,
  };

  for (const seg of segments) {
    counts[seg.sunExposure ?? "overhead"] += seg.distanceM;
  }

  return {
    totalGlareDistance,
    highGlareSegments,
    glarePercent: pct(totalGlareDistance),
    belowHorizonPercent: pct(counts["below-horizon"]),
    behindPercent: pct(counts.behind),
    leftPercent: pct(counts.left),
    rightPercent: pct(counts.right),
    overheadPercent: pct(counts.overhead),
    stretches: clusterGlareStretches(segments),
    dominantExposure: dominantExposure(counts),
  };
}
