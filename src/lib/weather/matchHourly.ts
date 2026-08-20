import type { HourlyWind, WeatherForecast } from "@/lib/types/weather";

export function findNearestHourlyWind(
  forecast: WeatherForecast,
  arrival: Date
): HourlyWind {
  const { hourly } = forecast;
  if (hourly.length === 0) {
    throw new Error("Forecast has no hourly data.");
  }

  let best = hourly[0];
  let bestDiff = Math.abs(best.time.getTime() - arrival.getTime());

  for (let i = 1; i < hourly.length; i++) {
    const diff = Math.abs(hourly[i].time.getTime() - arrival.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      best = hourly[i];
    }
  }

  return best;
}
