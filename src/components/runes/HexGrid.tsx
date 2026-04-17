"use client";

import { type SlotAverage, SlotCard } from "./SlotCard";

interface HexGridProps {
  slots: Record<number, SlotAverage[]>;
  priStats: Record<number, string>;
  isLoading?: boolean;
  onSlotClick: (slotNo: number) => void;
  centerContent: React.ReactNode;
}

export function HexGrid({
  slots,
  priStats,
  isLoading,
  onSlotClick,
  centerContent,
}: HexGridProps) {
  const W = 160; // largeur de toutes les cartes
  const H = 160; // hauteur de toutes les cartes
  const GAP = 12; // gap entre cartes

  const totalW = W * 3 + GAP * 2;
  const xLeft = 0;
  const xCenter = W + GAP;
  const xRight = W * 2 + GAP * 2;

  // Slot 1 est en haut, slot 4 en bas
  // Slots 2/6 et 3/5 commencent à mi-hauteur de slot 1
  const ySlot1 = 0;
  const ySlot26 = H / 2;
  const ySlot35 = H / 2 + H + GAP;
  const ySlot4 = H + GAP + H + GAP;

  const totalH = ySlot4 + H;

  // L'icône est centrée verticalement entre le top de slot 1 et le bottom de slot 4
  const yCenterIcon = totalH / 2;

  return (
    <div className="relative mx-auto" style={{ width: totalW, height: totalH }}>
      {/* Slot 1 — haut centre */}
      <div
        className="absolute"
        style={{ top: ySlot1, left: xCenter, width: W, height: H }}
      >
        <SlotCard
          slotNo={1}
          averages={slots[1] ?? []}
          isLoading={isLoading}
          onClick={() => onSlotClick(1)}
          cardHeight={H}
        />
      </div>

      {/* Slot 6 — gauche haut */}
      <div
        className="absolute"
        style={{ top: ySlot26, left: xLeft, width: W, height: H }}
      >
        <SlotCard
          slotNo={6}
          averages={slots[6] ?? []}
          priStat={priStats[6]}
          isLoading={isLoading}
          onClick={() => onSlotClick(6)}
          cardHeight={H}
        />
      </div>

      {/* Slot 2 — droite haut */}
      <div
        className="absolute"
        style={{ top: ySlot26, left: xRight, width: W, height: H }}
      >
        <SlotCard
          slotNo={2}
          averages={slots[2] ?? []}
          priStat={priStats[2]}
          isLoading={isLoading}
          onClick={() => onSlotClick(2)}
          cardHeight={H}
        />
      </div>

      {/* Slot 5 — gauche bas */}
      <div
        className="absolute"
        style={{ top: ySlot35, left: xLeft, width: W, height: H }}
      >
        <SlotCard
          slotNo={5}
          averages={slots[5] ?? []}
          isLoading={isLoading}
          onClick={() => onSlotClick(5)}
          cardHeight={H}
        />
      </div>

      {/* Slot 3 — droite bas */}
      <div
        className="absolute"
        style={{ top: ySlot35, left: xRight, width: W, height: H }}
      >
        <SlotCard
          slotNo={3}
          averages={slots[3] ?? []}
          isLoading={isLoading}
          onClick={() => onSlotClick(3)}
          cardHeight={H}
        />
      </div>

      {/* Slot 4 — bas centre */}
      <div
        className="absolute"
        style={{ top: ySlot4, left: xCenter, width: W, height: H }}
      >
        <SlotCard
          slotNo={4}
          averages={slots[4] ?? []}
          priStat={priStats[4]}
          isLoading={isLoading}
          onClick={() => onSlotClick(4)}
          cardHeight={H}
        />
      </div>

      {/* Icône set — centrée exactement au milieu de tout le bloc */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          top: yCenterIcon,
          left: xCenter,
          width: W,
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        {centerContent}
      </div>
    </div>
  );
}
