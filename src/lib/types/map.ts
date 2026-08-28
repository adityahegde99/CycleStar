import type { TrackPoint } from "@/lib/types/track";

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** A place the map should move to. A new object means "move again". */
export interface MapFocus {
  center: TrackPoint;
  bounds?: MapBounds;
}
