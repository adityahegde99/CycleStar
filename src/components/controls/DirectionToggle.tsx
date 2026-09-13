"use client";

import { RotateCw, RotateCcw } from "lucide-react";
import type { RideDirection } from "@/lib/types/wind";

interface DirectionToggleProps {
  value: RideDirection;
  onChange: (direction: RideDirection) => void;
  disabled?: boolean;
}

export default function DirectionToggle({
  value,
  onChange,
  disabled,
}: DirectionToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-cs-text">Loop Direction</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("clockwise")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
            value === "clockwise"
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
              : "border-cs-border bg-cs-input text-cs-muted hover:border-cs-muted"
          }`}
        >
          <RotateCw className="h-4 w-4" />
          Clockwise
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("counter-clockwise")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
            value === "counter-clockwise"
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
              : "border-cs-border bg-cs-input text-cs-muted hover:border-cs-muted"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Counter-CW
        </button>
      </div>
    </div>
  );
}
