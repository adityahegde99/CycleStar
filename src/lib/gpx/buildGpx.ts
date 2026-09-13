import type { TrackPoint } from "@/lib/types/track";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildGpx(points: TrackPoint[], name: string): string {
  const safeName = escapeXml(name.trim() || "CycleStar Route");
  const trackpoints = points
    .map((p) => `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="CycleStar" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>
`;
}

export function toGpxFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "cyclestar-route"}.gpx`;
}

export function downloadGpx(points: TrackPoint[], name: string): void {
  const blob = new Blob([buildGpx(points, name)], {
    type: "application/gpx+xml",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = toGpxFilename(name);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
