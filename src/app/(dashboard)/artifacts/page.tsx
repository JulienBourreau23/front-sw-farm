"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { artifactsApi } from "@/lib/api";
import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { ArtifactModal } from "@/components/artifacts/ArtifactModal";
import { translations } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

const ATTRIBUTES = [
  { id: 1, key: "fire"    },
  { id: 2, key: "water"   },
  { id: 3, key: "wind"    },
  { id: 4, key: "light"   },
  { id: 5, key: "dark"    },
] as const;

const UNIT_STYLES = [
  { id: 1, key: "atk"     },
  { id: 2, key: "def"     },
  { id: 3, key: "hp"      },
  { id: 4, key: "support" },
] as const;

const PRI_EFFECTS = [
  { id: 100, key: "priHp",  countKey: "hp"  },
  { id: 101, key: "priAtk", countKey: "atk" },
  { id: 102, key: "priDef", countKey: "def" },
] as const;

export default function ArtifactsPage() {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { lang } = useLangStore();
  const t = translations[lang].artifacts;

  const [elemAttr,  setElemAttr]  = useState<number | undefined>(undefined);
  const [elemPri,   setElemPri]   = useState<number | undefined>(undefined);
  const [styleUnit, setStyleUnit] = useState<number | undefined>(undefined);
  const [stylePri,  setStylePri]  = useState<number | undefined>(undefined);
  const [openModal, setOpenModal] = useState<"elemental" | "style" | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["artifact-stats", userId],
    queryFn:  () => artifactsApi.getStats(),
    staleTime: 1000 * 60 * 10,
    enabled:  !!userId,
  });

  const elemQuery = useQuery({
    queryKey: ["artifact-averages", "elemental", elemAttr, elemPri, userId],
    queryFn:  () => artifactsApi.getAverages({ type: 1, attribute: elemAttr, pri_effect_id: elemPri }),
    staleTime: 1000 * 60 * 5,
    enabled:  !!userId,
  });

  const styleQuery = useQuery({
    queryKey: ["artifact-averages", "style", styleUnit, stylePri, userId],
    queryFn:  () => artifactsApi.getAverages({ type: 2, unit_style: styleUnit, pri_effect_id: stylePri }),
    staleTime: 1000 * 60 * 5,
    enabled:  !!userId,
  });

  function buildBadge(parts: (string | undefined)[], count: number): string {
    return [...parts.filter(Boolean), `${count} ${t.artifacts}`].join(" • ");
  }

  const elemCount  = elemQuery.data?.artifact_count  ?? stats?.by_type.elemental ?? 0;
  const styleCount = styleQuery.data?.artifact_count ?? stats?.by_type.style     ?? 0;

  const elemBadge = buildBadge([
    elemAttr ? t[ATTRIBUTES.find((a) => a.id === elemAttr)?.key ?? "fire"]   : undefined,
    elemPri  ? t[PRI_EFFECTS.find((p) => p.id === elemPri)?.key ?? "priHp"] : undefined,
  ], elemCount);

  const styleBadge = buildBadge([
    styleUnit ? t[UNIT_STYLES.find((s) => s.id === styleUnit)?.key ?? "atk"]  : undefined,
    stylePri  ? t[PRI_EFFECTS.find((p) => p.id === stylePri)?.key ?? "priHp"] : undefined,
  ], styleCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="flex gap-4 items-start">

        {/* Carte élémentaire */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <select
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
              value={elemAttr ?? ""}
              onChange={(e) => setElemAttr(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t.allAttributes}</option>
              {ATTRIBUTES.map((a) => (
                <option key={a.id} value={a.id}>
                  {t[a.key]}{stats ? ` (${stats.by_attribute[a.key]})` : ""}
                </option>
              ))}
            </select>
            <select
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
              value={elemPri ?? ""}
              onChange={(e) => setElemPri(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t.allPri}</option>
              {PRI_EFFECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {t[p.key]}{stats ? ` (${stats.by_pri_effect[p.countKey]})` : ""}
                </option>
              ))}
            </select>
          </div>
          <ArtifactCard
            title={t.elemental}
            badge={elemBadge}
            averages={elemQuery.data?.averages ?? []}
            isLoading={elemQuery.isLoading}
            lang={lang}
            onClick={() => setOpenModal("elemental")}
          />
        </div>

        {/* Carte type */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <select
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
              value={styleUnit ?? ""}
              onChange={(e) => setStyleUnit(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t.allStyles}</option>
              {UNIT_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {t[s.key]}{stats ? ` (${stats.by_unit_style[s.key]})` : ""}
                </option>
              ))}
            </select>
            <select
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
              value={stylePri ?? ""}
              onChange={(e) => setStylePri(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t.allPri}</option>
              {PRI_EFFECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {t[p.key]}{stats ? ` (${stats.by_pri_effect[p.countKey]})` : ""}
                </option>
              ))}
            </select>
          </div>
          <ArtifactCard
            title={t.type}
            badge={styleBadge}
            averages={styleQuery.data?.averages ?? []}
            isLoading={styleQuery.isLoading}
            lang={lang}
            onClick={() => setOpenModal("style")}
          />
        </div>

      </div>

      {openModal === "elemental" && (
        <ArtifactModal
          title={t.elemental}
          badge={elemBadge}
          averages={elemQuery.data?.averages ?? []}
          lang={lang}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "style" && (
        <ArtifactModal
          title={t.type}
          badge={styleBadge}
          averages={styleQuery.data?.averages ?? []}
          lang={lang}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
