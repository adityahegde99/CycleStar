export interface TrackPoint {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp?: string;
}

export interface RawRoute {
  points: TrackPoint[];
  name?: string;
  totalDistanceM: number;
}
