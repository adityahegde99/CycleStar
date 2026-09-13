import { analyzeRouteWind } from "@/lib/wind/analyzeRoute";
import { buildSunNarrative } from "@/lib/solar/describeSun";
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
  const windDiff = Math.abs(cwHead - ccwHead);
  const glareDiff = Math.abs(
    clockwise.glare.glarePercent - counterClockwise.glare.glarePercent
  );

  let recommendation: DirectionComparison["recommendation"];
  if (windDiff < 2 && glareDiff >= 8) {
    recommendation =
      clockwise.glare.glarePercent <= counterClockwise.glare.glarePercent
        ? "clockwise"
        : "counter-clockwise";
  } else if (windDiff < 2) {
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

  const windTossUp = windDiff < 2;
  const glarePicked = windTossUp && glareDiff >= 8;

  let bannerText: string;
  if (recommendation === "neutral") {
    bannerText = `Clockwise has ${cwHead.toFixed(0)}% Headwind vs Counter-Clockwise has ${ccwHead.toFixed(0)}% Headwind. Either direction works!`;
  } else if (glarePicked) {
    bannerText = `Wind is a toss-up (${cwHead.toFixed(0)}% vs ${ccwHead.toFixed(0)}% headwind). Go ${winner} to keep the sun out of your eyes.`;
  } else {
    bannerText = `Clockwise has ${cwHead.toFixed(0)}% Headwind vs Counter-Clockwise has ${ccwHead.toFixed(0)}% Headwind. Go ${winner}!`;
    const winnerGlare =
      recommendation === "clockwise"
        ? clockwise.glare.glarePercent
        : counterClockwise.glare.glarePercent;
    const loserGlare =
      recommendation === "clockwise"
        ? counterClockwise.glare.glarePercent
        : clockwise.glare.glarePercent;
    if (winnerGlare - loserGlare > 12) {
      bannerText +=
        " Headwind is better this way, but you'll take more sun in your eyes than the other direction.";
    }
  }

  const cwSun = buildSunNarrative(
    clockwise.glare,
    clockwise.summary.totalDistanceM,
    params.unit
  );
  const ccwSun = buildSunNarrative(
    counterClockwise.glare,
    counterClockwise.summary.totalDistanceM,
    params.unit
  );

  let sunText: string;
  let sunAltText: string | undefined;

  if (recommendation === "clockwise") {
    sunText = `Clockwise: ${cwSun}`;
    sunAltText = `Counter-clockwise: ${ccwSun}`;
  } else if (recommendation === "counter-clockwise") {
    sunText = `Counter-clockwise: ${ccwSun}`;
    sunAltText = `Clockwise: ${cwSun}`;
  } else {
    sunText = `Clockwise: ${cwSun}`;
    sunAltText = `Counter-clockwise: ${ccwSun}`;
  }

  return {
    clockwise,
    counterClockwise,
    recommendation,
    bannerText,
    sunText,
    sunAltText,
  };
}
