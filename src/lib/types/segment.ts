import type { TrackPoint } from "./track";

export interface GPXSegment {
  index: number;
  start: TrackPoint;
  end: TrackPoint;
  coordinates: [number, number][];
  distanceM: number;
  cumulativeDistanceM: number;
  riderBearingDeg: number;
  estimatedArrival: Date;
  sunAzimuth?: number;
  sunAltitude?: number;
  isHighGlare?: boolean;
  sunExposure?: SunExposureKind;
}

export type SunExposureKind =
  | "in-eyes"
  | "behind"
  | "left"
  | "right"
  | "overhead"
  | "below-horizon";
