"use client";

import { cn } from "@/lib/utils";
import type { ArtifactAverage } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

// ── Labels basés sur sw-exporter/app/mapping.js ───────────────────────────────

export const EFFECT_LABELS: Record<number, { fr: string; en: string }> = {
  // Communs type=1 et type=2 (206-226)
  204: { en: "ATK Increasing Effect",                  fr: "Effet aug. ATQ" },
  205: { en: "DEF Increasing Effect",                  fr: "Effet aug. DEF" },
  206: { en: "SPD Increasing Effect",                  fr: "Effet aug. VIT" },
  207: { en: "Crit Rate Increasing Effect",             fr: "Effet aug. Tx Crit" },
  208: { en: "Damage Dealt by Counterattack",           fr: "Dgts de contre-attaque" },
  209: { en: "Damage Dealt by Attacking Together",      fr: "Dgts d'attaque conjointe" },
  210: { en: "Bomb Damage",                             fr: "Dégàts de bombes" },
  213: { en: "Damage Received Under Inability Effect",  fr: "Dgts reçus sous incapacité" },
  214: { en: "Received Crit DMG",                       fr: "Dgts CRIT reçus" },
  215: { en: "Life Drain",                              fr: "Drain de vie" },
  218: { en: "Additional Damage by % of HP",            fr: "Dgts supp. en prop. de PV" },
  219: { en: "Additional Damage by % of ATK",           fr: "Dgts supp. en prop. de ATQ" },
  220: { en: "Additional Damage by % of DEF",           fr: "Dgts supp. en prop. de DEF" },
  221: { en: "Additional Damage by % of SPD",           fr: "Dgts supp. en prop. de VIT" },
  222: { en: "CRIT DMG+ when enemy HP is good",         fr: "D.CRIT+ selon bon état PV enn." },
  223: { en: "CRIT DMG+ when enemy HP is bad",          fr: "D.CRIT+ selon mauv. état PV enn." },
  224: { en: "Single-target skill CRIT DMG on your turn", fr: "D.CRIT skill cible unique ce tour" },
  225: { en: "Counterattack/Co-op Attack DMG",          fr: "Dgts contre-attaque/attaque conjointe" },
  226: { en: "ATK/DEF UP Effect",                       fr: "Effet renforcement ATQ/DEF" },
  // Spécifiques type=1 — Attribut (300-309)
  300: { en: "Damage Dealt on Fire",                    fr: "Dgts infligés au Feu" },
  301: { en: "Damage Dealt on Water",                   fr: "Dgts infligés à l'Eau" },
  302: { en: "Damage Dealt on Wind",                    fr: "Dgts infligés au Vent" },
  303: { en: "Damage Dealt on Light",                   fr: "Dgts infligés à Lum." },
  304: { en: "Damage Dealt on Dark",                    fr: "Dgts infligés aux Tén." },
  305: { en: "Damage Received from Fire",               fr: "Dgts reçus du Feu" },
  306: { en: "Damage Received from Water",              fr: "Dgts reçus de l'Eau" },
  307: { en: "Damage Received from Wind",               fr: "Dgts reçus du Vent" },
  308: { en: "Damage Received from Light",              fr: "Dgts reçus de Lum." },
  309: { en: "Damage Received from Dark",               fr: "Dgts reçus des Tén." },
  // Spécifiques type=2 — Archetype (400-411)
  400: { en: "Skill 1 CRIT DMG",                        fr: "[Comp.1] Dgts CRIT" },
  401: { en: "Skill 2 CRIT DMG",                        fr: "[Comp.2] Dgts CRIT" },
  402: { en: "Skill 3 CRIT DMG",                        fr: "[Comp.3] Dgts CRIT" },
  403: { en: "Skill 4 CRIT DMG",                        fr: "[Comp.4] Dgts CRIT" },
  404: { en: "Skill 1 Recovery",                        fr: "[Comp.1] Aug. des soins" },
  405: { en: "Skill 2 Recovery",                        fr: "[Comp.2] Aug. des soins" },
  406: { en: "Skill 3 Recovery",                        fr: "[Comp.3] Aug. des soins" },
  407: { en: "Skill 1 Accuracy",                        fr: "[Comp.1] Aug. Précision" },
  408: { en: "Skill 2 Accuracy",                        fr: "[Comp.2] Aug. Précision" },
  409: { en: "Skill 3 Accuracy",                        fr: "[Comp.3] Aug. Précision" },
  410: { en: "[Skill 3/4] CRIT DMG",                    fr: "Dgts CRIT [Comp. 3/4]" },
  411: { en: "First Attack CRIT DMG",                   fr: "Dgts CRIT 1re attaque" },
};

export function getEffectLabel(effectId: number, lang: Lang): string {
  return EFFECT_LABELS[effectId]?.[lang] ?? `Effect ${effectId}`;
}

interface ArtifactCardProps {
  title: string;
  badge: string;
  averages: ArtifactAverage[];
  isLoading?: boolean;
  lang: Lang;
  onClick: () => void;
}

export function ArtifactCard({
  title, badge, averages, isLoading, lang, onClick,
}: ArtifactCardProps) {
  const top6 = averages.slice(0, 6);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-4 text-left w-full flex flex-col gap-3",
        "transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99] cursor-pointer",
      )}
    >
      <div>
        <h2 className="font-semibold text-sm">{title}</h2>
        {badge && <p className="text-xs text-muted-foreground mt-0.5">{badge}</p>}
      </div>

      {isLoading ? (
        <div className="space-y-2 w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <div key={i} className="h-7 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : top6.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6 w-full">Aucune donnée</p>
      ) : (
        <div className="space-y-1.5 w-full">
          {top6.map((avg) => {
            const pct = avg.max_value > 0 ? (avg.avg_value / avg.max_value) * 100 : 0;
            return (
              <div key={avg.effect_id} className="py-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {getEffectLabel(avg.effect_id, lang)}
                  </span>
                  <div className="flex gap-2 shrink-0 text-xs font-medium">
                    <span className="text-muted-foreground">{avg.avg_value.toFixed(1)}%</span>
                    <span className="text-primary/50">/{avg.max_value}%</span>
                  </div>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground/40 text-center w-full">
        cliquer pour détails
      </p>
    </button>
  );
}
