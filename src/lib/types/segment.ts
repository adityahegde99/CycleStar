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
}
