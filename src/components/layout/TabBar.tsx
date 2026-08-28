"use client";

import { PenLine, Wind } from "lucide-react";

export type AppTab = "analyze" | "draw";

interface TabBarProps {
  value: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; Icon: typeof Wind }[] = [
  { id: "analyze", label: "Wind Analyzer", Icon: Wind },
  { id: "draw", label: "Route Builder", Icon: PenLine },
];

export default function TabBar({ value, onChange }: TabBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            value === id
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
