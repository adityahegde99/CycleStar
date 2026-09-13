"use client";

import { useCallback, useState } from "react";
import { Shield } from "lucide-react";
import TabBar, { type AppTab } from "@/components/layout/TabBar";
import AnalyzeSidebar from "@/components/analyze/AnalyzeSidebar";
import DrawSidebar from "@/components/draw/DrawSidebar";
import RouteMap from "@/components/map/RouteMap";
import DrawMap from "@/components/map/DrawMap";
import LocationSearch from "@/components/map/LocationSearch";
import MapTopBar from "@/components/map/MapTopBar";
import { useWindAnalysis } from "@/hooks/useWindAnalysis";
import { useRouteDrawer } from "@/hooks/useRouteDrawer";
import { downloadGpx } from "@/lib/gpx/buildGpx";
import { toRawRoute } from "@/lib/gpx/buildRoute";
import type { GeocodeResult } from "@/lib/geocoding/nominatim";
import type { MapFocus } from "@/lib/types/map";

function MapHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center px-4">
      <div className="rounded-xl border border-cs-border bg-cs-overlay px-6 py-4 text-center shadow-lg backdrop-blur-sm">
        <p className="text-sm text-cs-muted">{children}</p>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [tab, setTab] = useState<AppTab>("draw");
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
    <div className="flex h-dvh flex-col overflow-hidden lg:grid lg:grid-cols-[384px_1fr]">
      <aside className="order-2 flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-cs-border bg-cs-sidebar pb-[env(safe-area-inset-bottom)] lg:order-1 lg:border-r lg:border-t-0">
        <div className="space-y-3 border-b border-cs-border p-3 lg:space-y-4 lg:p-5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="select-none text-2xl leading-none text-amber-400"
            >
              ✬
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-cs-text">
                CycleStar
              </h1>
              <p className="text-xs text-cs-subtle">
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

        <div className="mt-auto flex items-start gap-2 border-t border-cs-border p-3 lg:p-5">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-cs-subtle" />
          <p className="text-xs leading-relaxed text-cs-subtle">
            Your files stay on this device. Coordinates are sent to Open-Meteo
            for wind data, and to the OpenStreetMap routing and place-search
            services when snapping drawn routes to roads or looking up a place.
          </p>
        </div>
      </aside>

      <main className="relative order-1 h-[48dvh] shrink-0 lg:order-2 lg:h-full lg:min-h-0">
        {tab === "analyze" ? (
          <>
            {showAnalyzeHint && (
              <MapHint>
                Upload a GPX route to visualize wind along your ride
              </MapHint>
            )}
            <MapTopBar />
            <RouteMap
              analysis={windState.activeAnalysis}
              unit={windState.unit}
            />
          </>
        ) : (
          <>
            <MapTopBar>
              <LocationSearch onSelect={handleLocationSelect} />
            </MapTopBar>
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
