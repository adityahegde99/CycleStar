import { analyzeRouteWind } from "@/lib/wind/analyzeRoute";
import type { WeatherForecast } from "@/lib/types/weather";
import type { RawRoute } from "@/lib/types/track";
import type { DirectionComparison, RideParams } from "@/lib/types/wind";

export function compareDirections(
  route: RawRoute,
  params: RideParams,
  forecast: WeatherForecast
): DirectionComparison {
  const clockwise = analyzeRouteWind(route, params, forecast, "clockwise");
  const counterClockwise = analyzeRouteWind(
    route,
    params,
    forecast,
    "counter-clockwise"
  );

  const cwHead = clockwise.summary.headwindPercent;
  const ccwHead = counterClockwise.summary.headwindPercent;
  const diff = Math.abs(cwHead - ccwHead);

  let recommendation: DirectionComparison["recommendation"];
  if (diff < 2) {
    recommendation = "neutral";
  } else if (cwHead <= ccwHead) {
    recommendation = "clockwise";
  } else {
    recommendation = "counter-clockwise";
  }

  const winner =
    recommendation === "clockwise"
      ? "Clockwise"
      : recommendation === "counter-clockwise"
        ? "Counter-Clockwise"
        : "Either direction";

  const bannerText =
    recommendation === "neutral"
      ? `Clockwise has ${cwHead.toFixed(0)}% Headwind vs Counter-Clockwise has ${ccwHead.toFixed(0)}% Headwind. Either direction works!`
      : `Clockwise has ${cwHead.toFixed(0)}% Headwind vs Counter-Clockwise has ${ccwHead.toFixed(0)}% Headwind. Go ${winner}!`;

  return {
    clockwise,
    counterClockwise,
    recommendation,
    bannerText,
  };
}
