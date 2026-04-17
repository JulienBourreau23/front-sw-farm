"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { runesApi, statsApi } from "@/lib/api"

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
}

const RUNE_SETS: Record<number, string> = {
  1: "Energy", 2: "Guard", 3: "Swift", 4: "Blade", 5: "Rage",
  6: "Focus", 7: "Endure", 8: "Fatal", 10: "Despair", 11: "Vampire",
  13: "Violent", 14: "Nemesis", 15: "Will", 16: "Shield", 17: "Vengeance",
  18: "Destroy", 19: "Fight", 20: "Determination", 21: "Enhance",
  22: "Accuracy", 23: "Tolerance", 24: "Seal", 25: "Intangible",
}

interface Avg {
  stat_id: number
  stat_code: string
  stat_name_fr: string
  is_percent: boolean
  avg_base: number
  avg_with_grind: number
  rune_count: number
}

function StatRow({ avg, maxRunes }: { avg: Avg; maxRunes: number }) {
  const label = STAT_LABELS[avg.stat_code] ?? avg.stat_name_fr
  const pct = avg.rune_count / maxRunes
  const decimals = ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(avg.stat_code) ? 0 : 1
  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <div className="w-24 shrink-0">
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <div className="flex gap-4 shrink-0 text-sm font-medium">
        <span className="text-muted-foreground w-12 text-right">{avg.avg_base.toFixed(decimals)}</span>
        <span className="text-primary w-12 text-right">{avg.avg_with_grind.toFixed(decimals)}</span>
      </div>
      <div className="w-16 text-right">
        <span className="text-xs text-muted-foreground">{avg.rune_count.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id
  const [selectedSetId, setSelectedSetId] = useState<number | undefined>(undefined)
  const [topStat, setTopStat] = useState("SPD")

  const { data: totalData } = useQuery({
    queryKey: ["total-runes", userId],
    queryFn: () => statsApi.getTotalRunes(),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  })
  const totalRunes = totalData?.total_runes ?? 0

  const { data: globalData, isLoading: globalLoading, isError } = useQuery({
    queryKey: ["averages", "global", userId],
    queryFn: () => runesApi.getAverages({}),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  })

  const { data: setData, isLoading: setLoading } = useQuery({
    queryKey: ["averages", "set", selectedSetId, userId],
    queryFn: () => runesApi.getAverages({ set_id: selectedSetId }),
    enabled: selectedSetId !== undefined && !!userId,
    staleTime: 1000 * 60 * 5,
  })

  const { data: topSetsData } = useQuery({
    queryKey: ["top-sets", userId],
    queryFn: () => statsApi.getTopSets(5),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
  })

  const { data: top3Data } = useQuery({
    queryKey: ["top3-by-stat", topStat, userId],
    queryFn: () => statsApi.getTop3ByStat(topStat, 10),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
  })

  const globalAverages: Avg[] = globalData?.averages ?? []
  const displayAverages: Avg[] = selectedSetId !== undefined ? (setData?.averages ?? []) : globalAverages
  const maxRunes = Math.max(...displayAverages.map((a) => a.rune_count), 1)
  const isLoading = globalLoading || (selectedSetId !== undefined && setLoading)
  const decimals = (code: string) => ["HP_FLAT", "ATK_FLAT", "DEF_FLAT", "SPD"].includes(code) ? 0 : 1
  const setLabel = selectedSetId ? ` — ${RUNE_SETS[selectedSetId]}` : ""
  const maxFarmed = topSetsData?.[0]?.rune_count ?? 1

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
          <p>Aucun import trouvé.</p>
          <p className="text-sm mt-1">Importe ton fichier JSON SW pour commencer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {selectedSetId ? `Set ${RUNE_SETS[selectedSetId]}` : "Vue globale — tous sets confondus"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">Runes totales</p>
          <p className="text-2xl font-semibold mt-1">{totalRunes.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">Compte SW</p>
          <p className="text-lg font-semibold mt-1 truncate">{user?.username}</p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground truncate">VIT moy. grind{setLabel}</p>
          <p className="text-2xl font-semibold mt-1 text-primary">
            {displayAverages.find((a) => a.stat_code === "SPD")?.avg_with_grind.toFixed(1) ?? "—"}
          </p>
        </div>
        <div className="rounded-xl bg-card border p-4">
          <p className="text-xs text-muted-foreground">Set le plus farmé</p>
          <p className="text-lg font-semibold mt-1 truncate text-primary">
            {topSetsData?.[0]?.set_name ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {topSetsData?.[0]?.rune_count ?? 0} runes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">Moyennes substats</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Base · Avec grind</p>
            </div>
            <select
              className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground"
              value={selectedSetId ?? ""}
              onChange={(e) => setSelectedSetId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Tous les sets</option>
              {Object.entries(RUNE_SETS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : (
            <div className="divide-y">
              <div className="px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="w-24 shrink-0">Stat</div>
                <div className="flex-1" />
                <div className="flex gap-4 shrink-0">
                  <span className="w-12 text-right">Base</span>
                  <span className="w-12 text-right text-primary">Grind</span>
                </div>
                <div className="w-16 text-right">Runes</div>
              </div>
              {displayAverages.map((avg: Avg) => (
                <StatRow key={avg.stat_id} avg={avg} maxRunes={maxRunes} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-medium">Top 5 sets farmés</h2>
            </div>
            <div className="divide-y">
              {topSetsData ? topSetsData.map((item, i) => {
                const pct = item.rune_count / maxFarmed
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
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                      {item.rune_count}
                    </span>
                  </div>
                )
              }) : (
                <div className="px-4 py-4 text-center text-xs text-muted-foreground">Chargement...</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Top 3 sets</h2>
                <span className="text-xs text-muted-foreground">≥10%</span>
              </div>
              <select
                className="w-full text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground"
                value={topStat}
                onChange={(e) => setTopStat(e.target.value)}
              >
                {Object.entries(STAT_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <div className="divide-y">
              <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-5 shrink-0">#</div>
                <div className="flex-1">Set</div>
                <span className="w-10 text-right">Base</span>
                <span className="w-10 text-right text-primary">Grind</span>
              </div>
              {top3Data && top3Data.length > 0 ? (
                top3Data.map((item, i) => {
                  const medals = ["🥇", "🥈", "🥉"]
                  const dec = decimals(topStat)
                  return (
                    <div key={item.set_id} className="px-4 py-2.5 flex items-center gap-2">
                      <div className="w-5 shrink-0 text-sm">{medals[i]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.set_name}</p>
                        <p className="text-xs text-muted-foreground">{item.pct}%</p>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {item.avg_base.toFixed(dec)}
                      </span>
                      <span className="text-xs text-primary font-medium w-10 text-right">
                        {item.avg_with_grind.toFixed(dec)}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-4 text-center text-xs text-muted-foreground">Chargement...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
