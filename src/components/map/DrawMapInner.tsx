"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { RouteLeg } from "@/lib/routing/snapToRoads";
import type { MapFocus } from "@/lib/types/map";
import type { TrackPoint } from "@/lib/types/track";

const DEFAULT_CENTER: L.LatLngTuple = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;
const FOCUS_ZOOM = 14;

interface DrawMapInnerProps {
  waypoints: TrackPoint[];
  legs: RouteLeg[];
  onMapClick: (point: TrackPoint) => void;
  focus: MapFocus | null;
}

function waypointMarker(point: TrackPoint, index: number, isLast: boolean) {
  return L.circleMarker([point.lat, point.lng], {
    radius: index === 0 ? 7 : 5,
    color: index === 0 ? "#22c55e" : isLast ? "#38bdf8" : "#e4e4e7",
    fillColor: index === 0 ? "#22c55e" : isLast ? "#38bdf8" : "#18181b",
    fillOpacity: 1,
    weight: 2,
  }).bindTooltip(index === 0 ? "Start" : `Waypoint ${index + 1}`, {
    direction: "top",
  });
}

export default function DrawMapInner({
  waypoints,
  legs,
  onMapClick,
  focus,
}: DrawMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onMapClick);
  const didFitRef = useRef(false);
  const waypointCountRef = useRef(waypoints.length);

  // Keep the latest handler reachable without re-creating the map.
  useEffect(() => {
    clickRef.current = onMapClick;
  }, [onMapClick]);

  // Read by the focus effect, which must not re-run when waypoints change.
  useEffect(() => {
    waypointCountRef.current = waypoints.length;
  }, [waypoints]);

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

    map.on("click", (event: L.LeafletMouseEvent) => {
      clickRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });

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

  // Runs before the overlay effect so that on a remount an already-drawn route
  // still wins over a stale search result.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;

    // On a blank map the searched view is deliberate, so the first waypoint
    // must not re-fit and pull the rider somewhere else.
    if (waypointCountRef.current === 0) didFitRef.current = true;

    if (focus.bounds) {
      map.fitBounds(
        L.latLngBounds(
          [focus.bounds.south, focus.bounds.west],
          [focus.bounds.north, focus.bounds.east]
        ),
        { padding: [40, 40], maxZoom: FOCUS_ZOOM }
      );
    } else {
      map.setView([focus.center.lat, focus.center.lng], FOCUS_ZOOM);
    }
  }, [focus]);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();

    for (const leg of legs) {
      overlay.addLayer(
        L.polyline(
          leg.points.map((p) => [p.lat, p.lng] as L.LatLngTuple),
          {
            color: leg.snapped ? "#38bdf8" : "#f59e0b",
            weight: 5,
            opacity: 0.9,
            dashArray: leg.snapped ? undefined : "6 8",
            lineCap: "round",
            lineJoin: "round",
          }
        )
      );
    }

    waypoints.forEach((point, index) => {
      overlay.addLayer(
        waypointMarker(point, index, index === waypoints.length - 1)
      );
    });

    if (waypoints.length === 0) {
      didFitRef.current = false;
      return;
    }

    // Fit once per mount: on the first waypoint, or when returning to the tab
    // with a route already drawn. Later clicks must never yank the view.
    if (!didFitRef.current) {
      didFitRef.current = true;
      if (waypoints.length === 1) {
        map.setView(
          [waypoints[0].lat, waypoints[0].lng],
          Math.max(map.getZoom(), 14)
        );
      } else {
        map.fitBounds(
          L.latLngBounds(
            waypoints.map((p) => [p.lat, p.lng] as L.LatLngTuple)
          ),
          { padding: [40, 40] }
        );
      }
    }
  }, [waypoints, legs]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full cursor-crosshair" />
    </div>
  );
}
