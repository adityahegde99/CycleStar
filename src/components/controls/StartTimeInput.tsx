"use client";

import { Clock } from "lucide-react";

interface StartTimeInputProps {
  value: number;
  onChange: (minutes: number) => void;
}

function toTimeValue(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function StartTimeInput({ value, onChange }: StartTimeInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="start-time"
        className="flex items-center gap-2 text-sm font-medium text-zinc-300"
      >
        <Clock className="h-4 w-4" />
        Start Time
      </label>
      <input
        id="start-time"
        type="time"
        step={60}
        value={toTimeValue(value)}
        onChange={(e) => {
          const [h, m] = e.target.value.split(":").map(Number);
          if (!Number.isNaN(h) && !Number.isNaN(m)) {
            onChange(h * 60 + m);
          }
        }}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  );
}
