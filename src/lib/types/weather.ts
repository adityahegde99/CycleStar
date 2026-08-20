export interface HourlyWind {
  time: Date;
  windSpeed: number;
  windDirectionDeg: number;
  windGusts?: number;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: HourlyWind[];
  fetchedAt: Date;
}

export type SpeedUnit = "mph" | "kmh";
