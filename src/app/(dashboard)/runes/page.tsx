"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HexGrid } from "@/components/runes/HexGrid";
import type { SlotAverage } from "@/components/runes/SlotCard";
import { SlotModal } from "@/components/runes/SlotModal";
import { runesApi, statsApi } from "@/lib/api";

const RUNE_SETS: Record<number, string> = {
  1: "Energy",
  2: "Guard",
  3: "Swift",
  4: "Blade",
  5: "Rage",
  6: "Focus",
  7: "Endure",
  8: "Fatal",
  10: "Despair",
  11: "Vampire",
  13: "Violent",
  14: "Nemesis",
  15: "Will",
  16: "Shield",
  17: "Vengeance",
  18: "Destroy",
  19: "Fight",
  20: "Determination",
  21: "Enhance",
  22: "Accuracy",
  23: "Tolerance",
  24: "Seal",
  25: "Intangible",
};

const ALL_PRI_STATS: Record<number, { id: number; label: string }[]> = {
  2: [
    { id: 8, label: "VIT" },
    { id: 1, label: "PV +" },
    { id: 2, label: "PV %" },
    { id: 3, label: "ATQ +" },
    { id: 4, label: "ATQ %" },
    { id: 5, label: "DEF +" },
    { id: 6, label: "DEF %" },
  ],
  4: [
    { id: 1, label: "PV +" },
    { id: 2, label: "PV %" },
    { id: 3, label: "ATQ +" },
    { id: 4, label: "ATQ %" },
    { id: 5, label: "DEF +" },
    { id: 6, label: "DEF %" },
    { id: 9, label: "Tx critiq." },
    { id: 10, label: "Dgts critiq." },
  ],
  6: [
    { id: 1, label: "PV +" },
    { id: 2, label: "PV %" },
    { id: 3, label: "ATQ +" },
    { id: 4, label: "ATQ %" },
    { id: 5, label: "DEF +" },
    { id: 6, label: "DEF %" },
    { id: 11, label: "RES" },
    { id: 12, label: "Précision" },
  ],
};

const DEFAULT_PRI: Record<number, number> = { 2: 8, 4: 1, 6: 2 };

function SetIcon({ setId, setName }: { setId: number; setName: string }) {
  const [error, setError] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset error on setId change
  useEffect(() => {
    setError(false);
  }, [setId]);

  if (error) {
    return (
      <div className="w-14 h-14 bg-card border-2 border-primary/40 rounded-xl flex items-center justify-center text-lg font-bold text-primary">
        {setName.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`/images/runes-sets/${setId}.svg`}
      alt={setName}
      width={56}
      height={56}
      className="w-14 h-14"
      onError={() => setError(true)}
    />
  );
}

export default function RunesPage() {
  const [selectedSetId, setSelectedSetId] = useState(13);
  const [priStats, setPriStats] = useState<Record<number, number>>(DEFAULT_PRI);
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  const { data: availableData } = useQuery({
    queryKey: ["available-pri-stats", selectedSetId],
    queryFn: () => statsApi.getAvailablePriStats(selectedSetId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: allSetsData } = useQuery({
    queryKey: ["all-sets-count"],
    queryFn: () => statsApi.getTopSets(23),
    staleTime: 1000 * 60 * 10,
  });

  const setRuneCount =
    allSetsData?.find((s) => s.set_id === selectedSetId)?.rune_count ?? 0;

  useEffect(() => {
    if (!availableData) return;
    const newPri: Record<number, number> = { ...DEFAULT_PRI };
    for (const slot of [2, 4, 6]) {
      const available = availableData[slot.toString()] ?? [];
      const firstAvailable = ALL_PRI_STATS[slot]?.find((s) =>
        available.some((a: { stat_id: number }) => a.stat_id === s.id),
      );
      if (firstAvailable) newPri[slot] = firstAvailable.id;
    }
    setPriStats(newPri);
  }, [availableData]);

  const slot1 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 1, null],
    queryFn: () => runesApi.getAverages({ set_id: selectedSetId, slot_no: 1 }),
    staleTime: 1000 * 60 * 5,
  });
  const slot2 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 2, priStats[2]],
    queryFn: () =>
      runesApi.getAverages({
        set_id: selectedSetId,
        slot_no: 2,
        pri_stat: priStats[2],
      }),
    staleTime: 1000 * 60 * 5,
  });
  const slot3 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 3, null],
    queryFn: () => runesApi.getAverages({ set_id: selectedSetId, slot_no: 3 }),
    staleTime: 1000 * 60 * 5,
  });
  const slot4 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 4, priStats[4]],
    queryFn: () =>
      runesApi.getAverages({
        set_id: selectedSetId,
        slot_no: 4,
        pri_stat: priStats[4],
      }),
    staleTime: 1000 * 60 * 5,
  });
  const slot5 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 5, null],
    queryFn: () => runesApi.getAverages({ set_id: selectedSetId, slot_no: 5 }),
    staleTime: 1000 * 60 * 5,
  });
  const slot6 = useQuery({
    queryKey: ["averages", "slot", selectedSetId, 6, priStats[6]],
    queryFn: () =>
      runesApi.getAverages({
        set_id: selectedSetId,
        slot_no: 6,
        pri_stat: priStats[6],
      }),
    staleTime: 1000 * 60 * 5,
  });

  const slotData = [slot1, slot2, slot3, slot4, slot5, slot6];
  const slots: Record<number, SlotAverage[]> = {};
  slotData.forEach((q, i) => {
    slots[i + 1] = q.data?.averages ?? [];
  });
  const isLoading = slotData.some((q) => q.isLoading);

  const priStatLabels: Record<number, string> = {};
  for (const slot of [2, 4, 6]) {
    const found = ALL_PRI_STATS[slot]?.find((s) => s.id === priStats[slot]);
    priStatLabels[slot] = found?.label ?? "—";
  }

  const setName = RUNE_SETS[selectedSetId] ?? "Set";

  const availableIds: Record<number, Set<number>> = {
    2: new Set(),
    4: new Set(),
    6: new Set(),
  };
  if (availableData) {
    for (const slot of [2, 4, 6]) {
      const list = availableData[slot.toString()] ?? [];
      for (const a of list as { stat_id: number }[]) {
        availableIds[slot].add(a.stat_id);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Runes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Moyennes par slot et stat principale
          </p>
        </div>
        <select
          className="text-sm bg-card border border-border rounded-xl px-4 py-2 text-foreground"
          value={selectedSetId}
          onChange={(e) => setSelectedSetId(Number(e.target.value))}
        >
          {Object.entries(RUNE_SETS).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4">
        {[2, 4, 6].map((slot) => (
          <div key={slot} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Slot {slot} :</span>
            <select
              className="text-xs bg-card border border-primary/30 rounded-lg px-2 py-1.5 text-primary"
              value={priStats[slot]}
              onChange={(e) =>
                setPriStats((prev) => ({
                  ...prev,
                  [slot]: Number(e.target.value),
                }))
              }
            >
              {ALL_PRI_STATS[slot]?.map((s) => {
                const available = availableIds[slot].has(s.id);
                return (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={!available}
                    style={{ opacity: available ? 1 : 0.4 }}
                  >
                    {s.label}
                    {!available ? " —" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        ))}
      </div>

      <HexGrid
        slots={slots}
        priStats={priStatLabels}
        isLoading={isLoading}
        onSlotClick={(slot) => setOpenSlot(slot)}
        centerContent={
          <div className="flex flex-col items-center gap-2">
            <SetIcon setId={selectedSetId} setName={setName} />
            <p className="text-sm font-semibold">{setName}</p>
            <p className="text-xs text-muted-foreground">
              {setRuneCount > 0 ? `${setRuneCount} runes` : "—"}
            </p>
          </div>
        }
      />

      {openSlot !== null && (
        <SlotModal
          slotNo={openSlot}
          setName={setName}
          averages={slots[openSlot] ?? []}
          priStat={openSlot % 2 === 0 ? priStatLabels[openSlot] : undefined}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </div>
  );
}
