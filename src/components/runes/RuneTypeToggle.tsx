"use client";

import { cn } from "@/lib/utils";
import type { RuneType } from "@/lib/rune-stats";

interface RuneTypeToggleProps {
  value: RuneType;
  onChange: (v: RuneType) => void;
}

export function RuneTypeToggle({ value, onChange }: RuneTypeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5 text-xs">
      {(["normal", "ancient"] as RuneType[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "px-2.5 py-1 rounded-md transition-colors capitalize",
            value === t
              ? "bg-card text-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t === "normal" ? "Normal" : "Immémorial"}
        </button>
      ))}
    </div>
  );
}
