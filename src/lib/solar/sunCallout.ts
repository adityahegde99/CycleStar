import type { GPXSegment } from "@/lib/types/segment";

export type SunCalloutTone = "glare" | "back" | "overhead" | "night";

export interface SunCallout {
  text: string;
  tone: SunCalloutTone;
}

export function sunCallout(segment: GPXSegment): SunCallout {
  const { sunAltitude, sunExposure, isHighGlare } = segment;

  if (
    sunAltitude == null ||
    sunAltitude < 0 ||
    sunExposure === "below-horizon"
  ) {
    return { text: "Sun's down", tone: "night" };
  }

  if (isHighGlare) {
    return { text: "In your eyes", tone: "glare" };
  }

  if (sunExposure === "behind") {
    return { text: "At your back", tone: "back" };
  }

  return { text: "High overhead", tone: "overhead" };
}
