"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { parseGpxFile } from "@/lib/gpx/parseGpx";
import { computeRouteMidpoint } from "@/lib/spatial/bbox";
import { fetchOpenMeteoForecast } from "@/lib/weather/openMeteo";
import { compareDirections } from "@/lib/wind/compareDirections";
import { DEFAULT_START_MINUTES, SPEED_RANGE } from "@/lib/constants";
import type { RawRoute } from "@/lib/types/track";
import type { SpeedUnit, WeatherForecast } from "@/lib/types/weather";
import type {
  DirectionComparison,
  RideDirection,
  RideParams,
  WindAnalysisResult,
} from "@/lib/types/wind";

function buildRideParams(
  rideDate: string,
  startMinutes: number,
  averageSpeed: number,
  unit: SpeedUnit
): RideParams {
  const [y, m, d] = rideDate.split("-").map(Number);
  const hours = Math.floor(startMinutes / 60);
  const mins = startMinutes % 60;
  const startTime = new Date(y, m - 1, d, hours, mins, 0, 0);

  return { startTime, averageSpeed, unit, rideDate };
}

export function useWindAnalysis() {
  const [rawRoute, setRawRoute] = useState<RawRoute | null>(null);
  const [routeName, setRouteName] = useState<string | undefined>();
  const [rideDate, setRideDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [startMinutes, setStartMinutes] = useState(DEFAULT_START_MINUTES);
  const [averageSpeed, setAverageSpeed] = useState(SPEED_RANGE.mph.default);
  const [unit, setUnit] = useState<SpeedUnit>("mph");
  const [direction, setDirection] = useState<RideDirection>("clockwise");
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [comparison, setComparison] = useState<DirectionComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const forecastCacheRef = useRef<Map<string, WeatherForecast>>(new Map());

  const rideParams = useMemo(
    () => buildRideParams(rideDate, startMinutes, averageSpeed, unit),
    [rideDate, startMinutes, averageSpeed, unit]
  );

  const activeAnalysis: WindAnalysisResult | null = useMemo(() => {
    if (!comparison) return null;
    return direction === "clockwise"
      ? comparison.clockwise
      : comparison.counterClockwise;
  }, [comparison, direction]);

  const runAnalysis = useCallback(
    async (route: RawRoute, params: RideParams) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const midpoint = computeRouteMidpoint(route);
        const cacheKey = `${midpoint.lat.toFixed(3)},${midpoint.lng.toFixed(3)},${params.rideDate},${params.unit}`;

        let fc = forecastCacheRef.current.get(cacheKey);
        if (!fc) {
          fc = await fetchOpenMeteoForecast(
            midpoint,
            params.rideDate,
            params.unit,
            controller.signal
          );
          forecastCacheRef.current.set(cacheKey, fc);
        }

        if (controller.signal.aborted) return;

        setForecast(fc);
        const result = compareDirections(route, params, fc);
        setComparison(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Analysis failed.");
        setComparison(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Analysis itself is driven by the effect below, so publishing a route is all
  // any entry point has to do; that keeps a single code path for every recompute.
  const loadRoute = useCallback((route: RawRoute, name: string) => {
    setError(null);
    setComparison(null);
    setForecast(null);
    setRouteName(name);
    setLoading(true);
    setRawRoute(route);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setParsing(true);
      setError(null);
      setComparison(null);
      setForecast(null);

      try {
        const route = await parseGpxFile(file);
        loadRoute(route, route.name ?? file.name.replace(/\.gpx$/i, ""));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse GPX file."
        );
        setRawRoute(null);
        setRouteName(undefined);
      } finally {
        setParsing(false);
      }
    },
    [loadRoute]
  );

  useEffect(() => {
    if (!rawRoute) return;

    const timer = setTimeout(() => {
      runAnalysis(rawRoute, rideParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [rawRoute, rideParams, runAnalysis]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleUnitChange = useCallback(
    (newUnit: SpeedUnit) => {
      if (newUnit === unit) return;

      const range = SPEED_RANGE[newUnit];
      const converted =
        newUnit === "kmh" ? averageSpeed * 1.60934 : averageSpeed / 1.60934;

      setAverageSpeed(
        Math.min(range.max, Math.max(range.min, Math.round(converted)))
      );
      setUnit(newUnit);
    },
    [unit, averageSpeed]
  );

  return {
    rawRoute,
    routeName,
    rideDate,
    setRideDate,
    startMinutes,
    setStartMinutes,
    averageSpeed,
    setAverageSpeed,
    unit,
    setUnit: handleUnitChange,
    direction,
    setDirection,
    forecast,
    comparison,
    activeAnalysis,
    loading,
    parsing,
    error,
    handleFileUpload,
    loadRoute,
  };
}
