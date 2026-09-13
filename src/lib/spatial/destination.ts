const EARTH_RADIUS_M = 6_371_000;

export function offsetLatLng(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceM: number
): { lat: number; lng: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = ((distanceM / EARTH_RADIUS_M) * 180) / Math.PI;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = cosLat === 0 ? 0 : (dLat * Math.sin(rad)) / cosLat;

  return {
    lat: lat + dLat * Math.cos(rad),
    lng: lng + dLng,
  };
}
