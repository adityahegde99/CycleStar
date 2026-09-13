"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { WIND_COLORS } from "@/lib/constants";
import { buildSegmentLayers } from "./segmentLayers";
import { buildWindArrowLayers } from "./windArrowLayers";
import type { SpeedUnit } from "@/lib/types/weather";
import type { WindAnalysisResult } from "@/lib/types/wind";

const DEFAULT_CENTER: L.LatLngTuple = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

interface RouteMapInnerProps {
  analysis: WindAnalysisResult | null;
  unit: SpeedUnit;
}

function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-4 z-[600] rounded-lg border border-zinc-800 bg-zinc-950/85 px-3 py-2 backdrop-blur-sm">
      <ul className="space-y-1">
        {(["headwind", "crosswind", "tailwind"] as const).map((key) => (
          <li key={key} className="flex items-center gap-2 text-xs text-zinc-300">
            <span
              className="h-1 w-4 rounded-full"
              style={{ backgroundColor: WIND_COLORS[key] }}
            />
            <span className="capitalize">{key}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-zinc-800 pt-1.5 text-[10px] text-zinc-500">
        Arrows: wind on you. Gold labels: where the sun sits.
      </p>
    </div>
  );
}

export default function RouteMapInner({ analysis, unit }: RouteMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const fittedRouteKeyRef = useRef<string | null>(null);

  // Leaflet owns the container imperatively, so creation and teardown are paired
  // here. map.remove() clears Leaflet's internal container id, which is what makes
  // a Strict Mode remount safe.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    overlayRef.current = L.layerGroup().addTo(map);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      overlayRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();
    if (!analysis) {
      fittedRouteKeyRef.current = null;
      return;
    }

    for (const layer of buildSegmentLayers(analysis.segments, unit)) {
      overlay.addLayer(layer);
    }
    for (const layer of buildWindArrowLayers(analysis.segments, unit)) {
      overlay.addLayer(layer);
    }

    const routeKey = analysis.bbox.join(",");
    if (fittedRouteKeyRef.current !== routeKey) {
      fittedRouteKeyRef.current = routeKey;
      const [minLat, minLng, maxLat, maxLng] = analysis.bbox;
      map.fitBounds(L.latLngBounds([minLat, minLng], [maxLat, maxLng]), {
        padding: [40, 40],
        animate: false,
      });
    }
  }, [analysis, unit]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {analysis && <Legend />}
    </div>
  );
}
