"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { measurePathMeters } from "@/lib/gpx/buildRoute";
import { routeLeg, type RouteLeg } from "@/lib/routing/snapToRoads";
import type { TrackPoint } from "@/lib/types/track";

export function flattenLegs(
  waypoints: TrackPoint[],
  legs: RouteLeg[]
): TrackPoint[] {
  if (waypoints.length === 0) return [];
  if (legs.length === 0) return [...waypoints];

  // Each leg repeats the previous leg's final point, so trim the duplicate.
  const points: TrackPoint[] = [...legs[0].points];
  for (let i = 1; i < legs.length; i++) {
    points.push(...legs[i].points.slice(1));
  }
  return points;
}

export function useRouteDrawer() {
  const [waypoints, setWaypoints] = useState<TrackPoint[]>([]);
  const [legs, setLegs] = useState<RouteLeg[]>([]);
  const [closed, setClosed] = useState(false);
  const [routing, setRouting] = useState(false);
  const [name, setName] = useState("My Route");

  const abortRef = useRef<AbortController | null>(null);
  const routingRef = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runLeg = useCallback(async (from: TrackPoint, to: TrackPoint) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    routingRef.current = true;
    setRouting(true);
    try {
      return await routeLeg(from, to, controller.signal);
    } finally {
      routingRef.current = false;
      setRouting(false);
    }
  }, []);

  const addWaypoint = useCallback(
    async (pointToAdd: TrackPoint) => {
      // A closed loop is final; the rider must reopen it before extending.
      if (closed || routingRef.current) return;

      const previous = waypoints[waypoints.length - 1];
      setWaypoints((current) => [...current, pointToAdd]);
      if (!previous) return;

      try {
        const leg = await runLeg(previous, pointToAdd);
        setLegs((current) => [...current, leg]);
      } catch {
        // Aborted by a newer interaction; the waypoint list stays authoritative.
      }
    },
    [closed, runLeg, waypoints]
  );

  const closeLoop = useCallback(async () => {
    if (closed || routingRef.current || waypoints.length < 3) return;

    const last = waypoints[waypoints.length - 1];
    const first = waypoints[0];

    try {
      const leg = await runLeg(last, first);
      setLegs((current) => [...current, leg]);
      setClosed(true);
    } catch {
      // Aborted; leave the route open.
    }
  }, [closed, runLeg, waypoints]);

  const undo = useCallback(() => {
    abortRef.current?.abort();

    if (closed) {
      setLegs((current) => current.slice(0, -1));
      setClosed(false);
      return;
    }

    setWaypoints((current) => current.slice(0, -1));
    setLegs((current) => current.slice(0, -1));
  }, [closed]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setWaypoints([]);
    setLegs([]);
    setClosed(false);
  }, []);

  const points = useMemo(() => flattenLegs(waypoints, legs), [waypoints, legs]);

  const totalDistanceM = useMemo(() => measurePathMeters(points), [points]);

  const hasUnsnappedLegs = useMemo(
    () => legs.some((leg) => !leg.snapped),
    [legs]
  );

  return {
    waypoints,
    legs,
    points,
    closed,
    routing,
    name,
    setName,
    totalDistanceM,
    hasUnsnappedLegs,
    addWaypoint,
    closeLoop,
    undo,
    clear,
  };
}
