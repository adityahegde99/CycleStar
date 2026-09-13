"use client";

import type { SpeedUnit } from "@/lib/types/weather";

interface UnitToggleProps {
  value: SpeedUnit;
  onChange: (unit: SpeedUnit) => void;
}

export default function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="flex rounded-lg border border-cs-border bg-cs-input p-1">
      <button
        type="button"
        onClick={() => onChange("mph")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "mph"
            ? "bg-cs-chip text-cs-text"
            : "text-cs-subtle hover:text-cs-text"
        }`}
      >
        mph
      </button>
      <button
        type="button"
        onClick={() => onChange("kmh")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "kmh"
            ? "bg-cs-chip text-cs-text"
            : "text-cs-subtle hover:text-cs-text"
        }`}
      >
        km/h
      </button>
    </div>
  );
}
