import {
  CROSSWIND_MAX_DEG,
  HEADWIND_MAX_DEG,
} from "@/lib/constants";
import { acuteAngleDeg } from "@/lib/spatial/bearings";
import type { GPXSegment } from "@/lib/types/segment";
import type { HourlyWind } from "@/lib/types/weather";
import type {
  SegmentWindResult,
  WindClassification,
} from "@/lib/types/wind";

export function classifyWind(relativeAngleDeg: number): WindClassification {
  if (relativeAngleDeg <= HEADWIND_MAX_DEG) return "headwind";
  if (relativeAngleDeg <= CROSSWIND_MAX_DEG) return "crosswind";
  return "tailwind";
}

export function headwindComponent(
  windSpeed: number,
  riderBearingDeg: number,
  windFromDeg: number
): number {
  const rad = ((riderBearingDeg - windFromDeg) * Math.PI) / 180;
  return windSpeed * Math.cos(rad);
}

export function analyzeSegmentWind(
  segment: GPXSegment,
  hourly: HourlyWind
): SegmentWindResult {
  const relativeAngleDeg = acuteAngleDeg(
    segment.riderBearingDeg,
    hourly.windDirectionDeg
  );

  return {
    segment,
    windSpeed: hourly.windSpeed,
    windDirectionDeg: hourly.windDirectionDeg,
    relativeAngleDeg,
    classification: classifyWind(relativeAngleDeg),
    headwindComponent: headwindComponent(
      hourly.windSpeed,
      segment.riderBearingDeg,
      hourly.windDirectionDeg
    ),
  };
}
