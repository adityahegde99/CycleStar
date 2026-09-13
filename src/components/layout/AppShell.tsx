"use client";

import { useCallback, useState } from "react";
import { Shield } from "lucide-react";
import TabBar, { type AppTab } from "@/components/layout/TabBar";
import AnalyzeSidebar from "@/components/analyze/AnalyzeSidebar";
import DrawSidebar from "@/components/draw/DrawSidebar";
import RouteMap from "@/components/map/RouteMap";
import DrawMap from "@/components/map/DrawMap";
import LocationSearch from "@/components/map/LocationSearch";
import { useWindAnalysis } from "@/hooks/useWindAnalysis";
import { useRouteDrawer } from "@/hooks/useRouteDrawer";
import { downloadGpx } from "@/lib/gpx/buildGpx";
import { toRawRoute } from "@/lib/gpx/buildRoute";
import type { GeocodeResult } from "@/lib/geocoding/nominatim";
import type { MapFocus } from "@/lib/types/map";

function MapHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-6 py-4 text-center backdrop-blur-sm">
        <p className="text-sm text-zinc-400">{children}</p>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [tab, setTab] = useState<AppTab>("analyze");
  const windState = useWindAnalysis();
  const drawer = useRouteDrawer();
  const [drawFocus, setDrawFocus] = useState<MapFocus | null>(null);

  const { loadRoute } = windState;
  const { points, name } = drawer;

  const handleLocationSelect = useCallback((result: GeocodeResult) => {
    setDrawFocus({
      center: { lat: result.lat, lng: result.lng },
      bounds: result.bounds,
    });
  }, []);

  const handleDownload = useCallback(() => {
    downloadGpx(points, name);
  }, [points, name]);

  const handleAnalyze = useCallback(() => {
    const routeName = name.trim() || "Drawn Route";
    loadRoute(toRawRoute(points, routeName), routeName);
    setTab("analyze");
  }, [points, name, loadRoute]);

  const showAnalyzeHint =
    !windState.rawRoute && !windState.loading && !windState.parsing;

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[384px_1fr]">
      <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950">
        <div className="space-y-4 border-b border-zinc-800 p-5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="select-none text-2xl leading-none text-amber-400"
            >
              ✬
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-50">
                CycleStar
              </h1>
              <p className="text-xs text-zinc-500">
                Clockwise or counter-clockwise?
              </p>
            </div>
          </div>
          <TabBar value={tab} onChange={setTab} />
        </div>

        {tab === "analyze" ? (
          <AnalyzeSidebar {...windState} />
        ) : (
          <DrawSidebar
            drawer={drawer}
            unit={windState.unit}
            onDownload={handleDownload}
            onAnalyze={handleAnalyze}
          />
        )}

        <div className="mt-auto flex items-start gap-2 border-t border-zinc-800 p-5">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            Your files stay on this device. Coordinates are sent to Open-Meteo
            for wind data, and to the OpenStreetMap routing and place-search
            services when snapping drawn routes to roads or looking up a place.
          </p>
        </div>
      </aside>

      <main className="relative h-screen min-h-[400px]">
        {tab === "analyze" ? (
          <>
            {showAnalyzeHint && (
              <MapHint>
                Upload a GPX route to visualize wind along your ride
              </MapHint>
            )}
            <RouteMap
              analysis={windState.activeAnalysis}
              unit={windState.unit}
            />
          </>
        ) : (
          <>
            {drawer.waypoints.length === 0 && (
              <MapHint>Click the map to drop your first waypoint</MapHint>
            )}
            {/* Above Leaflet's own controls, which sit at z-index 1000. */}
            <div className="absolute left-1/2 top-4 z-[1100] w-[min(26rem,calc(100%-2rem))] -translate-x-1/2">
              <LocationSearch onSelect={handleLocationSelect} />
            </div>
            <DrawMap
              waypoints={drawer.waypoints}
              legs={drawer.legs}
              onMapClick={drawer.addWaypoint}
              focus={drawFocus}
            />
          </>
        )}
      </main>
    </div>
  );
}
