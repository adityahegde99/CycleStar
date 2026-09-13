export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function flipBearing(bearingDeg: number): number {
  return normalizeAngle(bearingDeg + 180);
}

export function acuteAngleDeg(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return diff > 180 ? 360 - diff : diff;
}

/** Signed clockwise angle from `fromDeg` to `toDeg` in (-180, 180]. */
export function signedAngleDeg(fromDeg: number, toDeg: number): number {
  let d = normalizeAngle(toDeg) - normalizeAngle(fromDeg);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}
