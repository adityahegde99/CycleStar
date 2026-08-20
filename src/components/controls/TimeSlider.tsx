"use client";

import { Clock } from "lucide-react";
import { TIME_RANGE } from "@/lib/constants";

interface TimeSliderProps {
  value: number;
  onChange: (minutes: number) => void;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function TimeSlider({ value, onChange }: TimeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Clock className="h-4 w-4" />
          Start Time
        </label>
        <span className="text-sm font-semibold text-emerald-400">
          {formatTime(value)}
        </span>
      </div>
      <input
        type="range"
        min={TIME_RANGE.minMinutes}
        max={TIME_RANGE.maxMinutes}
        step={TIME_RANGE.stepMinutes}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>6:00 AM</span>
        <span>8:00 PM</span>
      </div>
    </div>
  );
}
