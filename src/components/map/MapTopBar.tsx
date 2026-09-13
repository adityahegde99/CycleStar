"use client";

import type { ReactNode } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function MapTopBar({ children }: { children?: ReactNode }) {
  return (
    <div className="absolute inset-x-3 top-3 z-[1100] flex items-start gap-2">
      {children ? (
        <div className="min-w-0 flex-1">{children}</div>
      ) : (
        <div className="flex-1" />
      )}
      <ThemeToggle />
    </div>
  );
}
