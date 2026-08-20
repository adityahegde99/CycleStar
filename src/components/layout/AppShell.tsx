"use client";

import Sidebar from "@/components/layout/Sidebar";
import RouteMap from "@/components/map/RouteMap";
import { useWindAnalysis } from "@/hooks/useWindAnalysis";

export default function AppShell() {
  const windState = useWindAnalysis();

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[384px_1fr]">
      <Sidebar {...windState} />
      <main className="relative h-screen min-h-[400px]">
        {!windState.rawRoute && !windState.loading && !windState.parsing && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-6 py-4 text-center backdrop-blur-sm">
              <p className="text-sm text-zinc-400">
                Upload a GPX route to visualize wind along your ride
              </p>
            </div>
          </div>
        )}
        <RouteMap analysis={windState.activeAnalysis} unit={windState.unit} />
      </main>
    </div>
  );
}
