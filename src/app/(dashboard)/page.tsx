"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { runesApi, statsApi } from "@/lib/api";
import { RuneTypeToggle } from "@/components/runes/RuneTypeToggle";
import { SUBSTAT_MAX, type RuneType } from "@/lib/rune-stats";
import { translations } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

const STAT_LABELS: Record<string, { fr: string; en: string }> = {
  HP_FLAT:  { fr: "PV +",       en: "HP +"      },
  HP_PCT:   { fr: "PV %",       en: "HP %"      },
  ATK_FLAT: { fr: "ATQ +",      en: "ATK +"     },
  ATK_PCT:  { fr: "ATQ %",      en: "ATK %"     },
  DEF_FLAT: { fr: "DEF +",      en: "DEF +"     },
  DEF_PCT:  { fr: "DEF %",      en: "DEF %"     },
  SPD:      { fr: "VIT",        en: "SPD"       },
  CR:       { fr: "Tx critiq.", en: "Crit Rate" },
  CD:       { fr: "Dgts critiq.", en: "Crit DMG"},
  RES:      { fr: "RES",        en: "RES"       },
  ACC:      { fr: "Précision",  en: "ACC"       },
};

const RUNE_SETS: Record<number, string> = {
  1: "Energy", 2: "Guard", 3: "Swift", 4: "Blade", 5: "Rage",
  6: "Focus", 7: "Endure", 8: "Fatal", 10: "Despair", 11: "Vampire",
  13: "Violent", 14: "Nemesis", 15: "Will", 16: "Shield", 17: "Vengeance",
  18: "Destroy", 19: "Fight", 20: "Determination", 21: "Enhance",
  22: "Accuracy", 23: "Tolerance", 24: "Seal", 25: "Intangible",
};

interface Avg {
  stat_id: number;
  stat_code: string;
  stat_name_fr: string;
  is_percent: boolean;
  avg_base: number;
  avg_with_grind: number;
  rune_count: number;
}

function StatRow({
  avg,
  lang,
  runeType,
}: {
  avg: Avg;
  lang: "fr" | "en";
  runeType: RuneType;
}) {
  const labelObj  = STAT_LABELS[avg.stat_code];
  const label     = labelObj ? labelObj[lang] : avg.stat_name_fr;
  const decimals  = ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(avg.stat_code) ? 0 : 1;
  const maxVal    = SUBSTAT_MAX[runeType][avg.stat_code] ?? 1;
  const pct       = Math.min((avg.avg_with_grind / maxVal) * 100, 100);

  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <div className="w-24 shrink-0">
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex gap-3 shrink-0 text-sm font-medium">
        <span className="text-muted-foreground w-12 text-right">
          {avg.avg_base.toFixed(decimals)}
        </span>
        <span className="text-primary w-12 text-right">
          {avg.avg_with_grind.toFixed(decimals)}
        </span>
        <span className="text-muted-foreground/50 w-10 text-right text-xs">
          /{maxVal}
        </span>
      </div>
      <div className="w-14 text-right">
        <span className="text-xs text-muted-foreground">
          {avg.rune_count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { lang } = useLangStore();
  const t = translations[lang].dashboard;
  const [selectedSetId, setSelectedSetId] = useState<number | undefined>(undefined);
  const [topStat,   setTopStat]   = useState("SPD");
  const [runeType,  setRuneType]  = useState<RuneType>("normal");

  const { data: totalData } = useQuery({
    queryKey: ["total-runes", userId],
    queryFn:  () => statsApi.getTotalRunes(),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
  const totalRunes = totalData?.total_runes ?? 0;

  const { data: globalData, isLoading: globalLoading, isError } = useQuery({
    queryKey: ["averages", "global", runeType, userId],
    queryFn:  () => runesApi.getAverages({ is_ancient: runeType === "ancient" }),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });

  const { data: setData, isLoading: setLoading } = useQuery({
    queryKey: ["averages", "set", selectedSetId, runeType, userId],
    queryFn:  () => runesApi.getAverages({ set_id: selectedSetId, is_ancient: runeType === "ancient" }),
    enabled: selectedSetId !== undefined && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: topSetsData } = useQuery({
    queryKey: ["top-sets", userId],
    queryFn:  () => statsApi.getTopSets(5),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
  });

  const { data: top3Data } = useQuery({
    queryKey: ["top3-by-stat", topStat, userId],
    queryFn:  () => statsApi.getTop3ByStat(topStat, 10),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
  });

  const globalAverages: Avg[]  = globalData?.averages ?? [];
  const displayAverages: Avg[] = selectedSetId !== undefined ? (setData?.averages ?? []) : globalAverages;
  const isLoading = globalLoading || (selectedSetId !== undefined && setLoading);
  const decimals  = (code: string) => ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(code) ? 0 : 1;
  const setLabel  = selectedSetId ? ` — ${RUNE_SETS[selectedSetId]}` : "";
  const maxFarmed = topSetsData?.[0]?.rune_count ?? 1;

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
          <p>{t.noImport}</p>
          <p className="text-sm mt-1">{t.noImportSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedSetId ? `${t.setView} ${RUNE_SETS[selectedSetId]}` : t.globalView}
          </p>
        </div>
        <RuneTypeToggle value={runeType} onChange={setRuneType} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">{t.totalRunes}</p>
          <p className="text-2xl font-semibold mt-1">{totalRunes.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">{t.swAccount}</p>
          <p className="text-lg font-semibold mt-1 truncate">{user?.username}</p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground truncate">{t.avgSpd}{setLabel}</p>
          <p className="text-2xl font-semibold mt-1 text-primary">
            {displayAverages.find((a) => a.stat_code === "SPD")?.avg_with_grind.toFixed(1) ?? "—"}
          </p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">{t.topSet}</p>
          <p className="text-lg font-semibold mt-1 truncate text-primary">{topSetsData?.[0]?.set_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{topSetsData?.[0]?.rune_count ?? 0} {t.runes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">{t.substatAvg}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t.baseWithGrind}</p>
            </div>
            <select
              className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground"
              value={selectedSetId ?? ""}
              onChange={(e) => setSelectedSetId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t.allSets}</option>
              {Object.entries(RUNE_SETS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t.loading}</div>
          ) : (
            <div className="divide-y">
              <div className="px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="w-24 shrink-0">{t.stat}</div>
                <div className="flex-1" />
                <div className="flex gap-3 shrink-0">
                  <span className="w-12 text-right">{t.base}</span>
                  <span className="w-12 text-right text-primary">{t.grind}</span>
                  <span className="w-10 text-right text-muted-foreground/50">Max</span>
                </div>
                <div className="w-14 text-right">Runes</div>
              </div>
              {displayAverages.map((avg: Avg) => (
                <StatRow key={avg.stat_id} avg={avg} lang={lang} runeType={runeType} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-medium">{t.top5Sets}</h2>
            </div>
            <div className="divide-y">
              {topSetsData ? (
                topSetsData.map((item, i) => {
                  const pct = item.rune_count / maxFarmed;
                  return (
                    <div key={item.set_id} className="px-4 py-2.5 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{item.set_name}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {totalRunes ? ((item.rune_count / totalRunes) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{item.rune_count}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-center text-xs text-muted-foreground">{t.loading}</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{t.top3Sets}</h2>
                <span className="text-xs text-muted-foreground">{t.minPct}</span>
              </div>
              <select
                className="w-full text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground"
                value={topStat}
                onChange={(e) => setTopStat(e.target.value)}
              >
                {Object.entries(STAT_LABELS).map(([code, labels]) => (
                  <option key={code} value={code}>{labels[lang]}</option>
                ))}
              </select>
            </div>
            <div className="divide-y">
              <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-5 shrink-0">#</div>
                <div className="flex-1">Set</div>
                <span className="w-10 text-right">{t.base}</span>
                <span className="w-10 text-right text-primary">{t.grind}</span>
              </div>
              {top3Data && top3Data.length > 0 ? (
                top3Data.map((item, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const dec = decimals(topStat);
                  return (
                    <div key={item.set_id} className="px-4 py-2.5 flex items-center gap-2">
                      <div className="w-5 shrink-0 text-sm">{medals[i]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.set_name}</p>
                        <p className="text-xs text-muted-foreground">{item.pct}%</p>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{item.avg_base.toFixed(dec)}</span>
                      <span className="text-xs text-primary font-medium w-10 text-right">{item.avg_with_grind.toFixed(dec)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-center text-xs text-muted-foreground">{t.loading}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
