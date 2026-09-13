import { addSeconds } from "date-fns";
import { speedToMps } from "@/lib/constants";
import { orientSegmentsForDirection, sampleRouteSegments } from "@/lib/gpx/sampleRoute";
import { computeRouteBbox, computeRouteMidpoint } from "@/lib/spatial/bbox";
import { findNearestHourlyWind } from "@/lib/weather/matchHourly";
import { enrichSegmentGlare, summarizeGlare } from "@/lib/solar/analyzeGlare";
import { analyzeSegmentWind } from "@/lib/wind/trigonometry";
import type { WeatherForecast } from "@/lib/types/weather";
import type { RawRoute } from "@/lib/types/track";
import type {
  RideDirection,
  RideParams,
  RouteWindSummary,
  SegmentWindResult,
  WindAnalysisResult,
} from "@/lib/types/wind";

function assignArrivalTimes(
  segments: ReturnType<typeof sampleRouteSegments>,
  startTime: Date,
  speedMps: number
) {
  return segments.map((seg) => ({
    ...seg,
    estimatedArrival: addSeconds(
      startTime,
      (seg.cumulativeDistanceM + seg.distanceM / 2) / speedMps
    ),
  }));
}

function summarizeSegments(segments: SegmentWindResult[]): RouteWindSummary {
  const totalDistanceM = segments.reduce((s, r) => s + r.segment.distanceM, 0);

  let headwindDistanceM = 0;
  let tailwindDistanceM = 0;
  let crosswindDistanceM = 0;
  let headwindWeightedSum = 0;
  let headwindWeight = 0;

  for (const result of segments) {
    const d = result.segment.distanceM;
    switch (result.classification) {
      case "headwind":
        headwindDistanceM += d;
        break;
      case "tailwind":
        tailwindDistanceM += d;
        break;
      case "crosswind":
        crosswindDistanceM += d;
        break;
    }

    if (result.headwindComponent > 0) {
      headwindWeightedSum += result.headwindComponent * d;
      headwindWeight += d;
    }
  }

  const pct = (n: number) => (totalDistanceM > 0 ? (n / totalDistanceM) * 100 : 0);

  return {
    totalDistanceM,
    headwindDistanceM,
    tailwindDistanceM,
    crosswindDistanceM,
    headwindPercent: pct(headwindDistanceM),
    tailwindPercent: pct(tailwindDistanceM),
    crosswindPercent: pct(crosswindDistanceM),
    avgHeadwindSpeed: headwindWeight > 0 ? headwindWeightedSum / headwindWeight : 0,
  };
}

export function analyzeRouteWind(
  route: RawRoute,
  params: RideParams,
  forecast: WeatherForecast,
  direction: RideDirection
): WindAnalysisResult {
  const sampled = orientSegmentsForDirection(
    sampleRouteSegments(route),
    direction === "counter-clockwise"
  );
  const speedMps = speedToMps(params.averageSpeed, params.unit);
  const withTimes = assignArrivalTimes(sampled, params.startTime, speedMps);

  const withGlare = withTimes.map(enrichSegmentGlare);
  const segments = withGlare.map((seg) =>
    analyzeSegmentWind(seg, findNearestHourlyWind(forecast, seg.estimatedArrival))
  );

  return {
    direction,
    segments,
    summary: summarizeSegments(segments),
    glare: summarizeGlare(withGlare),
    forecast,
    bbox: computeRouteBbox(route),
    midpoint: computeRouteMidpoint(route),
  };
}
