"use client";

import {
  Download,
  Eraser,
  MapPin,
  RotateCcw,
  Undo2,
  Wind,
  TriangleAlert,
} from "lucide-react";
import { formatDistance } from "@/lib/constants";
import type { useRouteDrawer } from "@/hooks/useRouteDrawer";
import type { SpeedUnit } from "@/lib/types/weather";

interface DrawSidebarProps {
  drawer: ReturnType<typeof useRouteDrawer>;
  unit: SpeedUnit;
  onDownload: () => void;
  onAnalyze: () => void;
}

export default function DrawSidebar({
  drawer,
  unit,
  onDownload,
  onAnalyze,
}: DrawSidebarProps) {
  const {
    waypoints,
    points,
    closed,
    routing,
    name,
    setName,
    totalDistanceM,
    hasUnsnappedLegs,
    closeLoop,
    undo,
    clear,
  } = drawer;

  const canExport = points.length >= 2;

  return (
    <div className="flex flex-1 flex-col gap-5 p-5">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <MapPin className="h-4 w-4 text-sky-400" />
          Click the map to add waypoints
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
          Each new point is routed along real cycling roads. Close the loop when
          you are done, then download or analyze it.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="route-name"
          className="text-sm font-medium text-zinc-300"
        >
          Route Name
        </label>
        <input
          id="route-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Route"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Waypoints</span>
          <span className="text-sm font-semibold text-zinc-100">
            {waypoints.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Distance</span>
          <span className="text-sm font-semibold text-zinc-100">
            {formatDistance(totalDistanceM, unit)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Loop</span>
          <span
            className={`text-sm font-semibold ${closed ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {closed ? "Closed" : "Open"}
          </span>
        </div>
        {routing && (
          <p className="text-xs text-sky-400">Snapping to roads…</p>
        )}
      </div>

      {hasUnsnappedLegs && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-200">
            Some legs could not reach the routing service and were drawn as
            straight lines.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={waypoints.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
        <button
          type="button"
          onClick={closeLoop}
          disabled={closed || waypoints.length < 3 || routing}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Close
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={waypoints.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={!canExport}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          <Download className="h-4 w-4" />
          Download GPX
        </button>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canExport}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 disabled:opacity-40"
        >
          <Wind className="h-4 w-4" />
          Analyze this route
        </button>
      </div>
    </div>
  );
}
