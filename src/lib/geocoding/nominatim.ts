import type { MapBounds } from "@/lib/types/map";

// Nominatim is the geocoder behind openstreetmap.org. It needs no API key and
// sends permissive CORS headers, but its usage policy caps callers at roughly
// one request per second, so callers must debounce keystrokes.
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const RESULT_LIMIT = 6;

export interface GeocodeResult {
  id: string;
  label: string;
  lat: number;
  lng: number;
  bounds?: MapBounds;
}

interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
}

function toBounds(
  boundingbox: NominatimPlace["boundingbox"]
): MapBounds | undefined {
  if (!boundingbox) return undefined;

  const [south, north, west, east] = boundingbox.map(Number);
  if ([south, north, west, east].some((value) => !Number.isFinite(value))) {
    return undefined;
  }
  return { south, north, west, east };
}

/**
 * Looks up places matching a free-form query. Rejects with an AbortError when
 * the caller cancels; every other failure throws so the UI can report it.
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "jsonv2",
    limit: String(RESULT_LIMIT),
  });

  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Nominatim responded with ${response.status}`);
  }

  const places: NominatimPlace[] = await response.json();

  return places
    .map((place) => ({
      id: String(place.place_id),
      label: place.display_name,
      lat: Number(place.lat),
      lng: Number(place.lon),
      bounds: toBounds(place.boundingbox),
    }))
    .filter(
      (result) => Number.isFinite(result.lat) && Number.isFinite(result.lng)
    );
}
