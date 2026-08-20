import { addDays, format, parseISO } from "date-fns";
import type { HourlyWind, SpeedUnit, WeatherForecast } from "@/lib/types/weather";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m?: number[];
  };
}

export async function fetchOpenMeteoForecast(
  midpoint: { lat: number; lng: number },
  rideDate: string,
  unit: SpeedUnit,
  signal?: AbortSignal
): Promise<WeatherForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", midpoint.lat.toFixed(4));
  url.searchParams.set("longitude", midpoint.lng.toFixed(4));
  url.searchParams.set(
    "hourly",
    "wind_speed_10m,wind_direction_10m,wind_gusts_10m"
  );
  url.searchParams.set("wind_speed_unit", unit === "mph" ? "mph" : "kmh");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", rideDate);
  // Rides that start late can run past midnight, so include the following day.
  url.searchParams.set(
    "end_date",
    format(addDays(parseISO(rideDate), 1), "yyyy-MM-dd")
  );

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    let reason = "";
    try {
      const body = await response.json();
      if (typeof body?.reason === "string") reason = ` ${body.reason}`;
    } catch {
      reason = "";
    }
    throw new Error(
      `Weather forecast unavailable (${response.status}).${reason}`
    );
  }

  const data: OpenMeteoResponse = await response.json();
  const { hourly } = data;

  if (!hourly?.time?.length) {
    throw new Error("No hourly wind data returned for the selected date.");
  }

  const hourlyWind: HourlyWind[] = hourly.time.map((time, i) => ({
    time: new Date(time),
    windSpeed: hourly.wind_speed_10m[i] ?? 0,
    windDirectionDeg: hourly.wind_direction_10m[i] ?? 0,
    windGusts: hourly.wind_gusts_10m?.[i],
  }));

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    hourly: hourlyWind,
    fetchedAt: new Date(),
  };
}
