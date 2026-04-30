"use client";

import { X } from "lucide-react";
import type { SlotAverage } from "./SlotCard";
import { SUBSTAT_MAX, SUBSTAT_MAX_NO_GRIND, type RuneType } from "@/lib/rune-stats";

const STAT_LABELS: Record<string, string> = {
  HP_FLAT:  "PV +",
  HP_PCT:   "PV %",
  ATK_FLAT: "ATQ +",
  ATK_PCT:  "ATQ %",
  DEF_FLAT: "DEF +",
  DEF_PCT:  "DEF %",
  SPD:      "VIT",
  CR:       "Tx critiq.",
  CD:       "Dgts critiq.",
  RES:      "RES",
  ACC:      "Précision",
};

const FIXED_MAIN_STATS: Record<number, string> = {
  1: "ATQ +",
  3: "DEF +",
  5: "PV +",
};

interface SlotModalProps {
  slotNo: number;
  setName: string;
  averages: SlotAverage[];
  priStat?: string;
  runeType?: RuneType;
  onClose: () => void;
}

export function SlotModal({
  slotNo,
  setName,
  averages,
  priStat,
  runeType = "normal",
  onClose,
}: SlotModalProps) {
  const isPair      = slotNo % 2 === 0;
  const fixedStat   = FIXED_MAIN_STATS[slotNo];
  const mainStatLabel = isPair ? (priStat ?? "—") : fixedStat;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-card border rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Slot {slotNo} — {setName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stat principale :{" "}
              <span className={isPair ? "text-primary" : ""}>{mainStatLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Substats */}
        <div className="px-5 py-4 space-y-1">
          {/* En-têtes colonnes */}
          <div className="flex items-center gap-3 pb-2 text-xs text-muted-foreground border-b">
            <div className="flex-1">Substat</div>
            <div className="w-20 text-right">Runes</div>
            <div className="w-10 text-right">Base</div>
            <div className="w-12 text-right text-primary">Grind</div>
            <div className="w-12 text-right text-muted-foreground/60">Max</div>
          </div>

          {[...averages]
            .sort((a, b) => b.rune_count - a.rune_count)
            .map((avg) => {
              const label      = STAT_LABELS[avg.stat_code] ?? avg.stat_name_fr;
              const decimals   = ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(avg.stat_code) ? 0 : 1;
              const maxNoGrind = SUBSTAT_MAX_NO_GRIND[avg.stat_code] ?? 1;
              const maxGrind   = SUBSTAT_MAX[runeType][avg.stat_code] ?? 1;
              const pct        = Math.min((avg.avg_with_grind / maxGrind) * 100, 100);

              return (
                <div key={avg.stat_id} className="py-1.5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="flex-1 text-sm">{label}</span>
                    <span className="w-20 text-right text-xs text-muted-foreground">
                      {avg.rune_count.toLocaleString()} runes
                    </span>
                    <span className="w-10 text-right text-sm text-muted-foreground">
                      {avg.avg_base.toFixed(decimals)}
                    </span>
                    <span className="w-12 text-right text-sm text-primary font-medium">
                      {avg.avg_with_grind.toFixed(decimals)}
                    </span>
                    <span className="w-12 text-right text-xs text-muted-foreground/60">
                      {maxNoGrind}/{maxGrind}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/40 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
