"use client";

import { cn } from "@/lib/utils";
import type { ArtifactAverage } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

// ── Labels exacts depuis le JSON de traduction du jeu ─────────────────────────

export const EFFECT_LABELS: Record<number, { fr: string; en: string }> = {
  206: { en: "Increase Fire Damage",                       fr: "Aug.des dgts infl au Feu" },
  210: { en: "Increase Water Damage",                      fr: "Aug.des dgts infl à l'Eau" },
  214: { en: "Increase Wind Damage",                       fr: "Aug.des dgts infl au Vent" },
  215: { en: "Increase Light Damage",                      fr: "Aug.des dgts infl à Lum." },
  218: { en: "Increase Dark Damage",                       fr: "Aug. dgts infl. Tén." },
  219: { en: "Reduce Fire Damage",                         fr: "Réd.des dgts infl au Feu" },
  220: { en: "Reduce Water Damage",                        fr: "Réd.des dgts infl à l'Eau" },
  221: { en: "Reduce Wind Damage",                         fr: "Réd.des dgts infl au Vent" },
  222: { en: "Reduce Light Damage",                        fr: "Réd.des dgts infl à Lum." },
  223: { en: "Reduce Dark Damage",                         fr: "Réd. dgts infl. Tén." },
  224: { en: "[Comp.1] Increase Crit DMG",                 fr: "[Comp.1] Aug. Dgts CRIT" },
  225: { en: "[Comp.2] Increase Crit DMG",                 fr: "[Comp.2] Aug. Dgts CRIT" },
  226: { en: "Crit DMG [Skill 3/4] +",                    fr: "Dégàts CRIT [compétence 3/4] +" },
  227: { en: "Crit DMG 1st Attack +",                     fr: "DGTS CRIT 1re attaque +" },
  300: { en: "[Comp.1] Increase Healing",                  fr: "[Comp.1] Aug. des soins" },
  301: { en: "[Comp.2] Increase Healing",                  fr: "[Comp.2] Aug. des soins" },
  302: { en: "[Comp.3] Increase Healing",                  fr: "[Comp.3] Aug. des soins" },
  303: { en: "[Comp.1] Increase Accuracy",                 fr: "[Comp.1] Aug. Précision" },
  304: { en: "[Comp.2] Increase Accuracy",                 fr: "[Comp.2] Aug. Précision" },
  305: { en: "[Comp.3] Increase Accuracy",                 fr: "[Comp.3] Aug. Précision" },
  306: { en: "ATK/DEF Boost Effect +",                    fr: "Effet renforcement ATQ/DEF +" },
  307: { en: "SPD Boost Effect +",                        fr: "Effet aug. VIT +" },
  308: { en: "Bomb Damage +",                             fr: "Dégàts de bombes +" },
  309: { en: "Crit DMG Taken +",                          fr: "Dégàts CRIT reçus +" },
  400: { en: "Life Drain +",                              fr: "Drain de vie +" },
  401: { en: "Bonus Damage by HP +",                      fr: "Dgts supp. en prop. de PV" },
  404: { en: "Bonus Damage by ATK +",                     fr: "Dgts supp. en prop. de ATQ" },
  405: { en: "Bonus Damage by DEF +",                     fr: "Dgts supp. en prop. de DEF" },
  406: { en: "Bonus Damage by SPD +",                     fr: "Dgts supp. en prop. de VIT" },
  407: { en: "Crit DMG + when Enemy HP Good",             fr: "D.CRIT+ selon bon état PV enn." },
  408: { en: "Crit DMG + when Enemy Debuffed",            fr: "D.CRIT+ sel. mauv. état enn." },
  409: { en: "Crit DMG + when Ally Uses Skill This Turn", fr: "D.CRIT+ comp cib unis pdt tour" },
  410: { en: "Counter/Joint Attack DMG +",                fr: "Dégàts de contre-attaque/attaque conjointe +" },
  411: { en: "Other Substats",                            fr: "Autres sous propriétés" },
};

export function getEffectLabel(effectId: number, lang: Lang): string {
  return EFFECT_LABELS[effectId]?.[lang] ?? `Effect ${effectId}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ArtifactCardProps {
  title: string;
  badge: string;
  averages: ArtifactAverage[];
  isLoading?: boolean;
  lang: Lang;
  onClick: () => void;
}

// ── Carte résumé top 6 ────────────────────────────────────────────────────────

export function ArtifactCard({
  title,
  badge,
  averages,
  isLoading,
  lang,
  onClick,
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
