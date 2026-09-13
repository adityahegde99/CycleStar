import L from "leaflet";
import { WIND_ARROW_INTERVAL, WIND_COLORS } from "@/lib/constants";
import { sunCallout } from "@/lib/solar/sunCallout";
import type { SpeedUnit } from "@/lib/types/weather";
import type { SegmentWindResult, WindClassification } from "@/lib/types/wind";

const UNIT_LABEL: Record<SpeedUnit, string> = {
  mph: "mph",
  kmh: "km/h",
};

const KIND_LABEL: Record<WindClassification, string> = {
  headwind: "head",
  tailwind: "tail",
  crosswind: "cross",
};

function effectSpeed(result: SegmentWindResult): number {
  if (result.classification === "crosswind") {
    return Math.round(result.windSpeed);
  }
  return Math.abs(Math.round(result.headwindComponent));
}

function windArrowIcon(result: SegmentWindResult, unit: SpeedUnit): L.DivIcon {
  const blowingToDeg = (result.windDirectionDeg + 180) % 360;
  const kind = KIND_LABEL[result.classification];
  const color = WIND_COLORS[result.classification];
  const speed = effectSpeed(result);
  const unitLabel = UNIT_LABEL[unit];
  const sun = sunCallout(result.segment);

  return L.divIcon({
    className: "wind-arrow-marker",
    html: `<div class="wind-arrow">
      <svg class="wind-arrow-glyph" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="--wind-rotation:${blowingToDeg}deg">
        <path d="M12 22V2M12 2L4 11M12 2l8 9" stroke="#0b1220" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 22V2M12 2L4 11M12 2l8 9" stroke="#7dd3fc" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="wind-arrow-metric">
        <span class="wind-arrow-value" style="color:${color}">${speed} ${unitLabel}</span>
        <span class="wind-arrow-kind">${kind}</span>
        <span class="wind-arrow-sun wind-arrow-sun--${sun.tone}">${sun.text}</span>
      </div>
    </div>`,
    iconSize: [156, 78],
    iconAnchor: [22, 28],
  });
}

export function buildWindArrowLayers(
  segments: SegmentWindResult[],
  unit: SpeedUnit
): L.Layer[] {
  const layers: L.Layer[] = [];

  for (let i = 0; i < segments.length; i += WIND_ARROW_INTERVAL) {
    const result = segments[i];
    const { start, end } = result.segment;

    layers.push(
      L.marker([(start.lat + end.lat) / 2, (start.lng + end.lng) / 2], {
        icon: windArrowIcon(result, unit),
        interactive: false,
        keyboard: false,
      })
    );
  }

  return layers;
}
