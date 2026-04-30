"use client";

import { cn } from "@/lib/utils";
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

export interface SlotAverage {
  stat_id: number;
  stat_code: string;
  stat_name_fr: string;
  is_percent: boolean;
  avg_base: number;
  avg_with_grind: number;
  rune_count: number;
}

interface SlotCardProps {
  slotNo: number;
  averages: SlotAverage[];
  priStat?: string;
  isLoading?: boolean;
  onClick: () => void;
  cardHeight?: number;
  runeType?: RuneType;
}

export function SlotCard({
  slotNo,
  averages,
  priStat,
  isLoading,
  onClick,
  cardHeight = 160,
  runeType = "normal",
}: SlotCardProps) {
  const isPair = slotNo % 2 === 0;
  const fixedStat = FIXED_MAIN_STATS[slotNo];
  const top4 = [...averages]
    .sort((a, b) => b.rune_count - a.rune_count)
    .slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95 cursor-pointer w-full flex flex-col",
        isPair ? "border-primary/30" : "border-border",
      )}
      style={{ height: cardHeight }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className={cn("text-xs font-medium", isPair ? "text-primary" : "text-muted-foreground")}>
          Slot {slotNo}
        </span>
        <span className="text-xs text-muted-foreground">
          {isPair ? (priStat ?? "—") : fixedStat}
        </span>
      </div>

      {/* Substats top 4 */}
      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-1.5">
            {["sk1", "sk2", "sk3", "sk4"].map((k) => (
              <div key={k} className="h-3 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : top4.length > 0 ? (
          <div className="space-y-1">
            {top4.map((avg) => {
              const label    = STAT_LABELS[avg.stat_code] ?? avg.stat_name_fr;
              const decimals = ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(avg.stat_code) ? 0 : 1;
              const maxVal   = SUBSTAT_MAX[runeType][avg.stat_code] ?? 1;
              const pct      = Math.min((avg.avg_with_grind / maxVal) * 100, 100);
              return (
                <div key={avg.stat_id} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-muted-foreground truncate">{label}</span>
                    <span className="text-xs font-medium text-primary shrink-0">
                      {avg.avg_with_grind.toFixed(decimals)}
                      <span className="text-muted-foreground/50 font-normal">/{maxVal}</span>
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Aucune donnée</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground/40 mt-1 text-center shrink-0">
        cliquer pour détails
      </p>
    </button>
  );
}
