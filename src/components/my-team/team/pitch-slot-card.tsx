"use client";

import { cn } from "@/lib/utils";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { SquadSlot } from "@/lib/squad/formations";
import { slotLabel } from "@/lib/squad/formations";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface PitchSlotCardProps {
  slot: SquadSlot;
  player: FantasyPlayer | null;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onEmptyClick: () => void;
  onPlayerClick: () => void;
  draggable?: boolean;
}

function PlayerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white to-white/80 text-xs font-bold text-[#0066FF] shadow-md ring-2 ring-white/90">
      {initials}
    </div>
  );
}

export function PitchSlotCard({
  slot,
  player,
  isCaptain,
  isViceCaptain,
  onEmptyClick,
  onPlayerClick,
  draggable = false,
}: PitchSlotCardProps) {
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: slot.id });
  const { attributes, listeners, setNodeRef: dragRef, transform, isDragging } = useDraggable({
    id: player ? `player-${slot.id}` : slot.id,
    data: { slotId: slot.id, playerId: player?.id },
    disabled: !player || !draggable,
  });

  const ref = (node: HTMLDivElement | null) => {
    dropRef(node);
    if (player && draggable) dragRef(node);
  };

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  if (!player) {
    return (
      <button
        ref={dropRef}
        type="button"
        onClick={onEmptyClick}
        className={cn(
          "flex min-h-[88px] w-[72px] flex-col items-center justify-center gap-1 rounded-2xl",
          "border-2 border-dashed border-white/25 bg-white/8 px-1 py-2",
          "transition-all duration-300 active:scale-95",
          isOver && "border-[#00C853] bg-[#00C853]/15 scale-105"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white/50">
          +
        </span>
        <span className="text-center text-[9px] font-semibold leading-tight text-white/45">
          {slotLabel(slot.position, slot.zone)}
        </span>
      </button>
    );
  }

  const lastName = player.name.split(" ").pop() ?? player.name;
  const fixtureShort = player.upcomingFixture.replace(" vs ", "\nvs ");

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "relative w-[76px] transition-all duration-300",
        isDragging && "opacity-60",
        isOver && "scale-105"
      )}
    >
      <button
        type="button"
        onClick={onPlayerClick}
        {...(draggable ? { ...listeners, ...attributes } : {})}
        className={cn(
          "flex w-full flex-col items-center gap-1 rounded-2xl bg-white/95 p-1.5 shadow-lg",
          "ring-1 ring-black/5 transition-all active:scale-95",
          player.matchStatus === "live" && "ring-2 ring-[#E53935]/50"
        )}
      >
        <div className="relative">
          <PlayerInitials name={player.name} />
          {isCaptain && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0066FF] text-[8px] font-black text-white shadow">
              C
            </span>
          )}
          {isViceCaptain && !isCaptain && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#081120]/70 text-[8px] font-black text-white shadow">
              V
            </span>
          )}
          {player.matchStatus === "live" && (
            <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 animate-pulse rounded-full bg-[#E53935] ring-2 ring-white" />
          )}
        </div>
        <p className="max-w-full truncate text-[10px] font-bold text-[#081120]">{lastName}</p>
        <p className="whitespace-pre-line text-center text-[8px] font-medium leading-tight text-[#081120]/45">
          {fixtureShort}
        </p>
      </button>
    </div>
  );
}

export function BenchSlotCard({
  slot,
  player,
  isCaptain,
  onEmptyClick,
  onPlayerClick,
}: Omit<PitchSlotCardProps, "draggable" | "isViceCaptain">) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.id });
  const { attributes, listeners, setNodeRef: dragRef, transform, isDragging } = useDraggable({
    id: player ? `player-${slot.id}` : slot.id,
    data: { slotId: slot.id, playerId: player?.id },
    disabled: !player,
  });

  const ref = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (player) dragRef(node);
  };

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  if (!player) {
    return (
      <button
        ref={setNodeRef}
        type="button"
        onClick={onEmptyClick}
        className={cn(
          "flex h-[100px] w-[88px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl",
          "border-2 border-dashed border-white/20 bg-white/5",
          isOver && "border-[#00C853] bg-[#00C853]/10"
        )}
      >
        <span className="text-xl text-white/30">+</span>
        <span className="text-[9px] font-semibold text-white/40">Add Player</span>
      </button>
    );
  }

  return (
    <div ref={ref} style={style} className={cn("shrink-0 snap-start", isDragging && "opacity-50")}>
      <button
        type="button"
        onClick={onPlayerClick}
        {...listeners}
        {...attributes}
        className="wc-card flex h-[100px] w-[88px] flex-col items-center justify-center gap-1 p-2 hover:transform-none active:scale-95"
      >
        <div className="relative">
          <PlayerInitials name={player.name} />
          {isCaptain && (
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0066FF] text-[7px] font-black text-white">
              C
            </span>
          )}
        </div>
        <p className="max-w-full truncate text-[10px] font-bold text-[#081120]">
          {player.name.split(" ").pop()}
        </p>
        <p className="text-[9px] text-[#081120]/45">{player.position} · {player.totalPoints}pts</p>
      </button>
    </div>
  );
}
