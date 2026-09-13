import type { GPXSegment, SunExposureKind } from "./segment";
import type { WeatherForecast } from "./weather";

export type WindClassification = "headwind" | "crosswind" | "tailwind";

export type RideDirection = "clockwise" | "counter-clockwise";

export interface SegmentWindResult {
  segment: GPXSegment;
  windSpeed: number;
  windDirectionDeg: number;
  relativeAngleDeg: number;
  classification: WindClassification;
  headwindComponent: number;
}

export interface RouteWindSummary {
  totalDistanceM: number;
  headwindDistanceM: number;
  tailwindDistanceM: number;
  crosswindDistanceM: number;
  headwindPercent: number;
  tailwindPercent: number;
  crosswindPercent: number;
  avgHeadwindSpeed: number;
}

export interface GlareStretch {
  startDistanceM: number;
  endDistanceM: number;
  startTime: Date;
  endTime: Date;
}

export interface GlareSummary {
  totalGlareDistance: number;
  highGlareSegments: GPXSegment[];
  glarePercent: number;
  belowHorizonPercent: number;
  behindPercent: number;
  leftPercent: number;
  rightPercent: number;
  overheadPercent: number;
  stretches: GlareStretch[];
  dominantExposure: SunExposureKind;
}

export interface WindAnalysisResult {
  direction: RideDirection;
  segments: SegmentWindResult[];
  summary: RouteWindSummary;
  glare: GlareSummary;
  forecast: WeatherForecast;
  bbox: [number, number, number, number];
  midpoint: { lat: number; lng: number };
}

export interface DirectionComparison {
  clockwise: WindAnalysisResult;
  counterClockwise: WindAnalysisResult;
  recommendation: RideDirection | "neutral";
  bannerText: string;
  sunText: string;
  sunAltText?: string;
}

export interface RideParams {
  startTime: Date;
  averageSpeed: number;
  unit: import("./weather").SpeedUnit;
  rideDate: string;
}
