import L from "leaflet";
import { WIND_ARROW_INTERVAL } from "@/lib/constants";
import type { SegmentWindResult } from "@/lib/types/wind";

// Open-Meteo reports the direction wind blows FROM; arrows point the way it blows TO.
function windArrowIcon(windFromDeg: number, windSpeed: number): L.DivIcon {
  const blowingToDeg = (windFromDeg + 180) % 360;

  return L.divIcon({
    className: "",
    html: `<div class="wind-arrow" style="--wind-rotation:${blowingToDeg}deg">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21V4M12 4L6.5 9.5M12 4l5.5 5.5" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${Math.round(windSpeed)}</span>
    </div>`,
    iconSize: [26, 34],
    iconAnchor: [13, 17],
  });
}

export function buildWindArrowLayers(segments: SegmentWindResult[]): L.Layer[] {
  const layers: L.Layer[] = [];

  for (let i = 0; i < segments.length; i += WIND_ARROW_INTERVAL) {
    const result = segments[i];
    const { start, end } = result.segment;

    layers.push(
      L.marker([(start.lat + end.lat) / 2, (start.lng + end.lng) / 2], {
        icon: windArrowIcon(result.windDirectionDeg, result.windSpeed),
        interactive: false,
        keyboard: false,
      })
    );
  }

  return layers;
}
