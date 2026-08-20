"use client";

import type { SpeedUnit } from "@/lib/types/weather";

interface UnitToggleProps {
  value: SpeedUnit;
  onChange: (unit: SpeedUnit) => void;
}

export default function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 p-1">
      <button
        type="button"
        onClick={() => onChange("mph")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "mph"
            ? "bg-zinc-700 text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        mph
      </button>
      <button
        type="button"
        onClick={() => onChange("kmh")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "kmh"
            ? "bg-zinc-700 text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        km/h
      </button>
    </div>
  );
}
