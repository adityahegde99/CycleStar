import type { WindClassification } from "./types/wind";

export const SEGMENT_LENGTH_M = 750;

export const HEADWIND_MAX_DEG = 45;
export const CROSSWIND_MAX_DEG = 120;

export const WIND_COLORS: Record<WindClassification, string> = {
  headwind: "#ef4444",
  crosswind: "#eab308",
  tailwind: "#22c55e",
};

export const SPEED_RANGE = {
  mph: { min: 10, max: 30, default: 18 },
  kmh: { min: 16, max: 48, default: 29 },
};

export const TIME_RANGE = {
  minMinutes: 6 * 60,
  maxMinutes: 20 * 60,
  stepMinutes: 15,
  defaultMinutes: 10 * 60,
};

export const WIND_ARROW_INTERVAL = 3;

// Open-Meteo serves 16 days of forecast. Each analysis also pulls the day after the
// ride date so late rides that cross midnight still resolve, leaving 14 selectable days.
export const MAX_FORECAST_DAYS_AHEAD = 14;

export const MPH_TO_MPS = 0.44704;
export const KMH_TO_MPS = 1 / 3.6;

export function speedToMps(speed: number, unit: "mph" | "kmh"): number {
  return unit === "mph" ? speed * MPH_TO_MPS : speed * KMH_TO_MPS;
}

export function formatDistance(meters: number, unit: "mph" | "kmh"): string {
  if (unit === "mph") {
    const miles = meters / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(speed: number, unit: "mph" | "kmh"): string {
  return `${Math.round(speed)} ${unit === "mph" ? "mph" : "km/h"}`;
}
