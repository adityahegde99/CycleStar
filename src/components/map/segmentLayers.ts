import L from "leaflet";
import { WIND_COLORS, formatSpeed } from "@/lib/constants";
import { sunCallout } from "@/lib/solar/sunCallout";
import type { SpeedUnit } from "@/lib/types/weather";
import type { SegmentWindResult, WindClassification } from "@/lib/types/wind";

const CLASSIFICATION_LABELS: Record<WindClassification, string> = {
  headwind: "Headwind",
  crosswind: "Crosswind",
  tailwind: "Tailwind",
};

function sunLine(result: SegmentWindResult): string {
  const sun = sunCallout(result.segment);
  const { sunAltitude, sunAzimuth } = result.segment;
  if (sunAltitude == null || sunAzimuth == null || sun.tone === "night") {
    return sun.text;
  }
  return `${sun.text} · ${Math.round(sunAltitude)}&deg; up`;
}

function tooltipHtml(result: SegmentWindResult, unit: SpeedUnit): string {
  const arrival = result.segment.estimatedArrival.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const effect =
    result.headwindComponent >= 0
      ? `${formatSpeed(result.headwindComponent, unit)} against you`
      : `${formatSpeed(Math.abs(result.headwindComponent), unit)} pushing you`;

  const lines = [
    `<div class="wind-tooltip-title">${CLASSIFICATION_LABELS[result.classification]} &middot; ${arrival}</div>`,
    `<div>Wind ${formatSpeed(result.windSpeed, unit)} from ${Math.round(result.windDirectionDeg)}&deg;</div>`,
    `<div>Heading ${Math.round(result.segment.riderBearingDeg)}&deg; &middot; ${effect}</div>`,
    `<div>${sunLine(result)}</div>`,
  ];
  return lines.join("");
}

export function buildSegmentLayers(
  segments: SegmentWindResult[],
  unit: SpeedUnit
): L.Layer[] {
  return segments.map((result) => {
    const positions = result.segment.coordinates.map(
      ([lng, lat]) => [lat, lng] as L.LatLngTuple
    );

    return L.polyline(positions, {
      color: WIND_COLORS[result.classification],
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
    }).bindTooltip(tooltipHtml(result, unit), {
      sticky: true,
      direction: "top",
    });
  });
}
