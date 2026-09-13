import { formatDistance } from "@/lib/constants";
import type { SpeedUnit } from "@/lib/types/weather";
import type { GlareStretch, GlareSummary } from "@/lib/types/wind";

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function describeStretches(
  stretches: GlareStretch[],
  totalDistanceM: number,
  glareDistanceM: number,
  unit: SpeedUnit
): string {
  if (stretches.length === 0) return "";

  if (stretches.length > 1) {
    return `on ${stretches.length} stretches totaling ${formatDistance(glareDistanceM, unit)}`;
  }

  const stretch = stretches[0];
  const lengthM = Math.max(0, stretch.endDistanceM - stretch.startDistanceM);
  const when = `${formatClock(stretch.startTime)}–${formatClock(stretch.endTime)}`;

  if (stretch.startDistanceM <= totalDistanceM * 0.12) {
    return `for the first ${formatDistance(lengthM, unit)} (${when})`;
  }
  if (stretch.endDistanceM >= totalDistanceM * 0.88) {
    return `for the last ${formatDistance(lengthM, unit)} (${when})`;
  }
  return `from ${formatDistance(stretch.startDistanceM, unit)} to ${formatDistance(stretch.endDistanceM, unit)} (${when})`;
}

export function buildSunNarrative(
  glare: GlareSummary,
  totalDistanceM: number,
  unit: SpeedUnit
): string {
  if (glare.belowHorizonPercent >= 85) {
    return "The sun is down for this ride — no glare, but bring lights if you'll finish in the dark.";
  }

  const parts: string[] = [];

  if (glare.stretches.length > 0) {
    parts.push(
      `Sun in your eyes ${describeStretches(glare.stretches, totalDistanceM, glare.totalGlareDistance, unit)}.`
    );
  } else if (glare.dominantExposure === "behind") {
    parts.push("Sun stays at your back, so your face should stay shaded.");
  } else if (glare.dominantExposure === "overhead") {
    parts.push(
      "Sun is high overhead — little glare in your eyes, but not much shade on open road."
    );
  } else if (glare.dominantExposure === "left") {
    parts.push("Sun sits mostly on your left — visor or glasses help, but it shouldn't be in your eyes.");
  } else if (glare.dominantExposure === "right") {
    parts.push("Sun sits mostly on your right — visor or glasses help, but it shouldn't be in your eyes.");
  } else if (glare.dominantExposure === "in-eyes") {
    parts.push("Sun is often ahead, but it stays high enough that glare should stay mild.");
  }

  if (glare.belowHorizonPercent > 12 && glare.belowHorizonPercent < 85) {
    parts.push(
      `${glare.belowHorizonPercent.toFixed(0)}% of the route is before sunrise or after sunset.`
    );
  }

  return parts.join(" ") || "Sun stays off your line of sight.";
}
