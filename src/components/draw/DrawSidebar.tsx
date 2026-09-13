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
    <div className="flex flex-1 flex-col gap-4 p-3 lg:gap-5 lg:p-5">
      <div className="rounded-xl border border-cs-border bg-cs-card/80 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-cs-text">
          <MapPin className="h-4 w-4 text-sky-400" />
          How to build a route
        </div>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-cs-muted">
          <li>Search a place above the map, or pan to where you ride.</li>
          <li>Tap or click anywhere on the map to drop your first point.</li>
          <li>
            Keep tapping to add points. Each new point is connected along real
            cycling roads.
          </li>
          <li>
            Use Undo to go back, Close to finish a loop, or Clear to start over.
          </li>
          <li>Name the route, then download a GPX or analyze the wind.</li>
        </ol>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="route-name"
          className="text-sm font-medium text-cs-text"
        >
          Route Name
        </label>
        <input
          id="route-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Route"
          className="w-full rounded-lg border border-cs-border bg-cs-input px-3 py-2.5 text-sm text-cs-text placeholder:text-cs-subtle focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-cs-border bg-cs-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-cs-muted">Waypoints</span>
          <span className="text-sm font-semibold text-cs-text">
            {waypoints.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-cs-muted">Distance</span>
          <span className="text-sm font-semibold text-cs-text">
            {formatDistance(totalDistanceM, unit)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-cs-muted">Loop</span>
          <span
            className={`text-sm font-semibold ${closed ? "text-emerald-500" : "text-cs-subtle"}`}
          >
            {closed ? "Closed" : "Open"}
          </span>
        </div>
        {routing && (
          <p className="text-xs text-sky-500">Snapping to roads…</p>
        )}
      </div>

      {hasUnsnappedLegs && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
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
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-cs-border bg-cs-input px-2 py-2.5 text-xs font-medium text-cs-text transition-colors hover:border-cs-muted disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
        <button
          type="button"
          onClick={closeLoop}
          disabled={closed || waypoints.length < 3 || routing}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-cs-border bg-cs-input px-2 py-2.5 text-xs font-medium text-cs-text transition-colors hover:border-cs-muted disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Close
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={waypoints.length === 0}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-cs-border bg-cs-input px-2 py-2.5 text-xs font-medium text-cs-text transition-colors hover:border-cs-muted disabled:opacity-40"
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
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:bg-cs-chip disabled:text-cs-subtle"
        >
          <Download className="h-4 w-4" />
          Download GPX
        </button>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canExport}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-cs-border bg-cs-input px-3 py-2.5 text-sm font-medium text-cs-text transition-colors hover:border-cs-muted disabled:opacity-40"
        >
          <Wind className="h-4 w-4" />
          Analyze this route
        </button>
      </div>
    </div>
  );
}
