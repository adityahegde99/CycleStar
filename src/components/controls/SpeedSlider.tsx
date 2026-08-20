"use client";

import { Gauge } from "lucide-react";
import { SPEED_RANGE, formatSpeed } from "@/lib/constants";
import type { SpeedUnit } from "@/lib/types/weather";

interface SpeedSliderProps {
  value: number;
  unit: SpeedUnit;
  onChange: (speed: number) => void;
}

export default function SpeedSlider({ value, unit, onChange }: SpeedSliderProps) {
  const range = SPEED_RANGE[unit];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Gauge className="h-4 w-4" />
          Average Speed
        </label>
        <span className="text-sm font-semibold text-emerald-400">
          {formatSpeed(value, unit)}
        </span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{formatSpeed(range.min, unit)}</span>
        <span>{formatSpeed(range.max, unit)}</span>
      </div>
    </div>
  );
}
