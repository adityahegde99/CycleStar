"use client";

import { format, addDays } from "date-fns";
import { Calendar } from "lucide-react";
import { MAX_FORECAST_DAYS_AHEAD } from "@/lib/constants";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const maxDate = format(
    addDays(new Date(), MAX_FORECAST_DAYS_AHEAD),
    "yyyy-MM-dd"
  );
  const minDate = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Calendar className="h-4 w-4" />
        Ride Date
      </label>
      <input
        type="date"
        value={value}
        min={minDate}
        max={maxDate}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}
