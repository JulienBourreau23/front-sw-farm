"use client";

import { type SlotAverage, SlotCard } from "./SlotCard";
import type { RuneType } from "@/lib/rune-stats";

interface HexGridProps {
  slots: Record<number, SlotAverage[]>;
  priStats: Record<number, string>;
  isLoading?: boolean;
  runeType?: RuneType;
  onSlotClick: (slotNo: number) => void;
  centerContent: React.ReactNode;
}

export function HexGrid({
  slots,
  priStats,
  isLoading,
  runeType = "normal",
  onSlotClick,
  centerContent,
}: HexGridProps) {
  const W = 160;
  const H = 160;
  const GAP = 12;

  const totalW = W * 3 + GAP * 2;
  const xLeft   = 0;
  const xCenter = W + GAP;
  const xRight  = W * 2 + GAP * 2;

  const ySlot1  = 0;
  const ySlot26 = H / 2;
  const ySlot35 = H / 2 + H + GAP;
  const ySlot4  = H + GAP + H + GAP;

  const totalH    = ySlot4 + H;
  const yCenterIcon = totalH / 2;

  return (
    <div className="relative mx-auto" style={{ width: totalW, height: totalH }}>
      <div className="absolute" style={{ top: ySlot1, left: xCenter, width: W, height: H }}>
        <SlotCard slotNo={1} averages={slots[1] ?? []} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(1)} cardHeight={H} />
      </div>
      <div className="absolute" style={{ top: ySlot26, left: xLeft, width: W, height: H }}>
        <SlotCard slotNo={6} averages={slots[6] ?? []} priStat={priStats[6]} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(6)} cardHeight={H} />
      </div>
      <div className="absolute" style={{ top: ySlot26, left: xRight, width: W, height: H }}>
        <SlotCard slotNo={2} averages={slots[2] ?? []} priStat={priStats[2]} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(2)} cardHeight={H} />
      </div>
      <div className="absolute" style={{ top: ySlot35, left: xLeft, width: W, height: H }}>
        <SlotCard slotNo={5} averages={slots[5] ?? []} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(5)} cardHeight={H} />
      </div>
      <div className="absolute" style={{ top: ySlot35, left: xRight, width: W, height: H }}>
        <SlotCard slotNo={3} averages={slots[3] ?? []} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(3)} cardHeight={H} />
      </div>
      <div className="absolute" style={{ top: ySlot4, left: xCenter, width: W, height: H }}>
        <SlotCard slotNo={4} averages={slots[4] ?? []} priStat={priStats[4]} isLoading={isLoading} runeType={runeType} onClick={() => onSlotClick(4)} cardHeight={H} />
      </div>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ top: yCenterIcon, left: xCenter, width: W, transform: "translateY(-50%)", pointerEvents: "none" }}
      >
        {centerContent}
      </div>
    </div>
  );
}
