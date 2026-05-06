"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { monstersApi, type Monster } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

const ELEMENTS = [
  { id: 0, emoji: "⚔️",  fr: "Tous",     en: "All"   },
  { id: 1, emoji: "🔥",  fr: "Feu",      en: "Fire"  },
  { id: 2, emoji: "💧",  fr: "Eau",      en: "Water" },
  { id: 3, emoji: "🌀",  fr: "Vent",     en: "Wind"  },
  { id: 4, emoji: "☀️",  fr: "Lumière",  en: "Light" },
  { id: 5, emoji: "🌑",  fr: "Ténèbre",  en: "Dark"  },
] as const;

const ELEMENT_STYLES: Record<number, { border: string; text: string; bg: string; badge: string }> = {
  1: { border: "border-orange-400/30", text: "text-orange-400",  bg: "bg-orange-400/5",  badge: "bg-orange-400/15 text-orange-300"  },
  2: { border: "border-blue-400/30",   text: "text-blue-400",    bg: "bg-blue-400/5",    badge: "bg-blue-400/15 text-blue-300"      },
  3: { border: "border-yellow-400/30", text: "text-yellow-400",  bg: "bg-yellow-400/5",  badge: "bg-yellow-400/15 text-yellow-300"  },
  4: { border: "border-slate-400/30",  text: "text-slate-200",   bg: "bg-slate-200/5",   badge: "bg-slate-200/15 text-slate-100"    },
  5: { border: "border-purple-400/30", text: "text-purple-400",  bg: "bg-purple-400/5",  badge: "bg-purple-400/15 text-purple-300"  },
};

const SHINE_CSS = `
  @property --shine-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  .shine-border-wrapper {
    position: relative;
    border-radius: 14px;
    padding: 2px;
    background: conic-gradient(
      from var(--shine-angle),
      transparent 70%,
      #c084fc 80%,
      #818cf8 85%,
      #38bdf8 90%,
      transparent 100%
    );
    animation: shine-rotate 2s linear infinite;
  }
  @keyframes shine-rotate {
    to { --shine-angle: 360deg; }
  }
  .shine-border-inner {
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    background: var(--card);
  }
`;

function ShineStyleInjector() {
  useEffect(() => {
    if (document.getElementById("shine-border-style")) return;
    const style = document.createElement("style");
    style.id = "shine-border-style";
    style.textContent = SHINE_CSS;
    document.head.appendChild(style);
  }, []);
  return null;
}

function MonsterCard({ monster, lang, showBadge }: { monster: Monster; lang: "fr" | "en"; showBadge: boolean }) {
  const [imgError, setImgError] = useState(false);
  const name    = lang === "fr" ? monster.name_fr : monster.name_en;
  const styles  = ELEMENT_STYLES[monster.element];
  const elLabel = lang === "fr" ? monster.element_fr : monster.element_en;

  const inner = (
    <div className={`rounded-xl flex flex-col items-center gap-2 p-3 transition-all hover:scale-[1.02] hover:shadow-lg relative
      ${`bg-card ${styles?.bg ?? ""}`}
    `}>
      {monster.is_skilled_up && (
        <div className="absolute top-1.5 right-1.5 text-xs leading-none" title={lang === "fr" ? "Skills maxés" : "Fully skilled up"}>
          👑
        </div>
      )}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
        {!imgError ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/monsters/icon/${monster.unit_master_id}`}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-2xl">👾</span>
        )}
      </div>
      <p className="text-xs font-medium text-center leading-tight line-clamp-2 text-foreground w-full">{name}</p>
      {monster.natural_stars !== null && monster.natural_stars > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: monster.natural_stars }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stars
            <span key={i} className="text-yellow-400 text-[10px]">★</span>
          ))}
        </div>
      )}
      {showBadge && styles && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${styles.badge}`}>{elLabel}</span>
      )}
    </div>
  );

  const wrapped = monster.lucksack_url ? (
    <a href={monster.lucksack_url} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : inner;

  if (monster.is_skilled_up) {
    return (
      <div className="shine-border-wrapper">
        <div className="shine-border-inner">{wrapped}</div>
      </div>
    );
  }

  return wrapped;
}

function MonsterCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card flex flex-col items-center gap-2 p-3 animate-pulse">
      <div className="w-16 h-16 rounded-lg bg-muted" />
      <div className="h-3 w-20 bg-muted rounded" />
      <div className="h-2 w-12 bg-muted rounded" />
    </div>
  );
}

export default function MonstersPage() {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { lang } = useLangStore();

  const [activeElement, setActiveElement] = useState(0);
  const [search, setSearch]               = useState("");
  const [skilledOnly, setSkilledOnly]     = useState(false);

  const { data: monsters, isLoading, isError } = useQuery({
    queryKey: ["owned-monsters", userId],
    queryFn:  () => monstersApi.getOwned(),
    staleTime: 1000 * 60 * 5,
    enabled:  !!userId,
  });

  const countByElement = useMemo(() => {
    if (!monsters) return {} as Record<number, number>;
    return monsters.reduce<Record<number, number>>((acc, m) => {
      acc[m.element] = (acc[m.element] ?? 0) + 1;
      return acc;
    }, {});
  }, [monsters]);

  const filtered = useMemo(() => {
    if (!monsters) return [];
    let list = monsters;
    if (activeElement !== 0) list = list.filter((m) => m.element === activeElement);
    if (skilledOnly)         list = list.filter((m) => m.is_skilled_up);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.name_fr.toLowerCase().includes(q) || m.name_en.toLowerCase().includes(q));
    }
    return list;
  }, [monsters, activeElement, skilledOnly, search]);

  const totalCount   = monsters?.length ?? 0;
  const skilledCount = monsters?.filter((m) => m.is_skilled_up).length ?? 0;

  return (
    <>
      <ShineStyleInjector />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">{lang === "fr" ? "Monstres" : "Monsters"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading
              ? (lang === "fr" ? "Chargement..." : "Loading...")
              : `${totalCount} ${lang === "fr" ? "monstres possédés" : "owned monsters"}${skilledCount > 0 ? ` · 👑 ${skilledCount} ${lang === "fr" ? "maxés" : "skilled up"}` : ""}`}
          </p>
        </div>

        {/* Recherche */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "Rechercher (FR ou EN)..." : "Search (FR or EN)..."}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">✕</button>
          )}
        </div>

        {/* Onglets éléments + toggle skill up */}
        <div className="flex items-center gap-2">
          {/* Onglets — scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
            {ELEMENTS.map((el) => {
              const count    = el.id === 0 ? totalCount : (countByElement[el.id] ?? 0);
              const isActive = activeElement === el.id;
              const styles   = el.id !== 0 ? ELEMENT_STYLES[el.id] : null;
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => setActiveElement(el.id)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                    "border transition-all whitespace-nowrap shrink-0",
                    isActive
                      ? styles
                        ? `${styles.border} ${styles.text} ${styles.bg}`
                        : "border-primary/50 text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  <span>{el.emoji}</span>
                  <span>{lang === "fr" ? el.fr : el.en}</span>
                  {count > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Toggle skill up — à droite, fixe */}
          <button
            type="button"
            onClick={() => setSkilledOnly((v) => !v)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap shrink-0",
              skilledOnly
                ? "border-yellow-400/50 text-yellow-400 bg-yellow-400/10"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
            ].join(" ")}
            title={lang === "fr" ? "Afficher uniquement les monstres maxés" : "Show only skilled up monsters"}
          >
            <span>👑</span>
            <span>{lang === "fr" ? "Maxés" : "Skilled up"}</span>
            {skilledCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">{skilledCount}</span>}
          </button>
        </div>

        {/* Contenu */}
        {isError && (
          <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            {lang === "fr" ? "Erreur lors du chargement des monstres." : "Error loading monsters."}
          </div>
        )}

        {!isError && (
          <>
            {search && !isLoading && (
              <p className="text-xs text-muted-foreground">
                {filtered.length} {lang === "fr" ? "résultat(s)" : "result(s)"} pour «{search}»
              </p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {isLoading
                ? Array.from({ length: 24 }).map((_, i) => <MonsterCardSkeleton key={i} />)
                : filtered.length > 0
                  ? filtered.map((monster) => (
                      <MonsterCard key={monster.unit_id_sw} monster={monster} lang={lang} showBadge={activeElement === 0} />
                    ))
                  : (
                    <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                      {search
                        ? (lang === "fr" ? "Aucun monstre trouvé pour cette recherche." : "No monster found.")
                        : skilledOnly
                          ? (lang === "fr" ? "Aucun monstre maxé dans cet élément." : "No skilled up monsters here.")
                          : (lang === "fr" ? "Aucun monstre dans cet élément." : "No monsters in this element.")}
                    </div>
                  )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
