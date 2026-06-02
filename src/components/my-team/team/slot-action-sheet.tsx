"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Crown,
  User,
  Trash2,
} from "lucide-react";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { PlayerAvatar } from "@/components/player/player-avatar";
import { getNationFlag } from "@/lib/nations";
import { getPositionLabel } from "@/lib/players/types";
import { getNationTheme } from "@/lib/nation-theme";
import type { SquadSlot } from "@/lib/squad/formations";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";

type SheetView = "actions" | "substitution";

interface SlotActionSheetProps {
  open: boolean;
  onClose: () => void;
  slot: SquadSlot | null;
  player: FantasyPlayer | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  substitutionTargets: { slot: SquadSlot; player: FantasyPlayer }[];
  onViewProfile: () => void;
  onSubstitution: (targetSlotId: string) => void;
  onMakeCaptain: () => void;
  onMakeViceCaptain: () => void;
  onRemove: () => void;
}

export function SlotActionSheet({
  open,
  onClose,
  slot,
  player,
  isCaptain,
  isViceCaptain,
  substitutionTargets,
  onViewProfile,
  onSubstitution,
  onMakeCaptain,
  onMakeViceCaptain,
  onRemove,
}: SlotActionSheetProps) {
  const [view, setView] = useState<SheetView>("actions");

  const handleClose = () => {
    setView("actions");
    onClose();
  };

  if (!slot || !player) return null;

  const zoneLabel = slot.zone === "starter" ? "Starting XI" : "Bench";
  const theme = getNationTheme(player.nation);

  return (
    <MobileFullScreenModal
      open={open}
      onClose={handleClose}
      title={view === "substitution" ? "Substitute" : player.name}
      subtitle={view === "actions" ? `${zoneLabel} · ${getPositionLabel(player.position)}` : undefined}
      className="flex flex-col gap-3"
    >
      {view === "substitution" ? (
        <SubstitutionList
          player={player}
          slot={slot}
          targets={substitutionTargets}
          onBack={() => setView("actions")}
          onSelect={(targetSlotId) => {
            onSubstitution(targetSlotId);
            handleClose();
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="relative shrink-0">
              <div className="h-14 w-14 overflow-hidden rounded-xl ring-2 ring-[#FFD700]/40">
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photoUrl}
                  className="h-full w-full"
                  initialsClassName="h-full w-full text-lg font-black text-white"
                />
              </div>
              <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[10px] font-black text-[#FFD700] ring-1 ring-[#FFD700]/50">
                {player.currentMatchdayPoints ?? 0}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{player.name}</p>
              <p className="text-xs text-white/55">
                {getPositionLabel(player.position)} · {getNationFlag(player.nation)}{" "}
                {theme.abbr}
              </p>
              <p className="mt-0.5 text-xs text-white/45">
                {player.totalPoints} pts total · MD {player.currentMatchdayPoints ?? 0}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-black text-white ring-1 ring-[#FFD700]/35">
              {player.managerNationAbbr ?? "—"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <ActionButton
              icon={ArrowLeftRight}
              label="Substitute"
              onClick={() => setView("substitution")}
              primary
            />
            <ActionButton icon={User} label="View Profile" onClick={onViewProfile} />
            <ActionButton
              icon={Crown}
              label={isCaptain ? "Captain ✓" : "Make Captain"}
              onClick={onMakeCaptain}
              disabled={isCaptain}
            />
            <ActionButton
              icon={Crown}
              label={isViceCaptain ? "Vice-Captain ✓" : "Make Vice-Captain"}
              onClick={onMakeViceCaptain}
              disabled={isViceCaptain}
            />
            <ActionButton
              icon={Trash2}
              label={slot.zone === "starter" ? "Remove from Lineup" : "Remove from Bench"}
              onClick={onRemove}
              danger
            />
            <ActionButton icon={ArrowLeft} label="Close" onClick={handleClose} />
          </div>
        </>
      )}
    </MobileFullScreenModal>
  );
}

function SubstitutionList({
  player,
  slot,
  targets,
  onBack,
  onSelect,
}: {
  player: FantasyPlayer;
  slot: SquadSlot;
  targets: { slot: SquadSlot; player: FantasyPlayer }[];
  onBack: () => void;
  onSelect: (targetSlotId: string) => void;
}) {
  const isStarter = slot.zone === "starter";
  const positionLabel = getPositionLabel(player.position).toLowerCase();

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#0066FF]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <p className="text-sm text-white/60">
        Swap {player.name} with a {isStarter ? "bench" : "Starting XI"} {positionLabel}
      </p>

      {targets.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/40">
          No valid substitutions available.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {targets.map(({ slot: targetSlot, player: targetPlayer }) => (
            <button
              key={targetSlot.id}
              type="button"
              onClick={() => onSelect(targetSlot.id)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-3 text-left ring-1 ring-white/10 active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/40 text-sm font-black text-[#FFD700]">
                {targetPlayer.currentMatchdayPoints ?? 0}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{targetPlayer.name}</p>
                <p className="text-xs text-white/50">{targetPlayer.totalPoints} pts</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
  danger,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
        primary
          ? "bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#081120]"
          : danger
            ? "bg-[#E53935]/20 text-[#FF8A80]"
            : "bg-white/10 text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </button>
  );
}
