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
        className="flex items-center gap-2 text-sm font-medium text-cs-text"
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
        className="cs-time-input w-full rounded-lg border border-cs-border bg-cs-input px-3 py-2.5 text-sm text-cs-text focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}
