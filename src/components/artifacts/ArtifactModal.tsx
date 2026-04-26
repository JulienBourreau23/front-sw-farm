"use client";

import { X } from "lucide-react";
import type { ArtifactAverage } from "@/lib/api";
import type { Lang } from "@/lib/i18n";
import { getEffectLabel } from "./ArtifactCard";

interface ArtifactModalProps {
  title: string;
  badge: string;
  averages: ArtifactAverage[];
  lang: Lang;
  onClose: () => void;
}

export function ArtifactModal({
  title, badge, averages, lang, onClose,
}: ArtifactModalProps) {
  const maxCount = Math.max(...averages.map((a) => a.artifact_count), 1);

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
        className="bg-card border rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <h2 className="font-semibold text-sm">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{badge}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground border-b pb-2 mb-2">
            <div className="flex-1">Effet</div>
            <div className="w-20 text-right">Artefacts</div>
            <div className="w-12 text-right">Moy.</div>
            <div className="w-14 text-right text-primary">Max</div>
          </div>

          {averages.map((avg) => {
            const pct = avg.max_value > 0 ? avg.avg_value / avg.max_value : 0;
            return (
              <div key={avg.effect_id} className="py-1.5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="flex-1 text-sm">
                    {getEffectLabel(avg.effect_id, lang)}
                  </span>
                  <span className="w-20 text-right text-xs text-muted-foreground">
                    {avg.artifact_count.toLocaleString()} art.
                  </span>
                  <span className="w-12 text-right text-sm text-muted-foreground">
                    {avg.avg_value.toFixed(1)}%
                  </span>
                  <span className="w-14 text-right text-sm font-medium text-primary">
                    {avg.max_value}%
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 rounded-full"
                    style={{ width: `${Math.min(pct * 100, 100)}%` }}
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
