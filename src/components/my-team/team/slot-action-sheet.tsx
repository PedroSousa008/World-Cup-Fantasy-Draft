"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Crown,
  Search,
  UserPlus,
  User,
  Trash2,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import { slotLabel } from "@/lib/squad/formations";
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
  onAddPlayer: () => void;
  onSearchPlayer: () => void;
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
  onAddPlayer,
  onSearchPlayer,
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

  if (!slot) return null;

  const slotTitle = player
    ? player.name
    : slot.zone === "bench"
      ? "Bench Slot"
      : slotLabel(slot.position, slot.zone);

  const zoneLabel = slot.zone === "starter" ? "Starting XI" : "Bench";

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={view === "substitution" ? "Substitution" : slotTitle}
      className="z-[105]"
    >
      {view === "substitution" && player ? (
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
      ) : player ? (
        <FilledSlotActions
          player={player}
          zoneLabel={zoneLabel}
          isCaptain={isCaptain}
          isViceCaptain={isViceCaptain}
          hasSubstitutionTargets={substitutionTargets.length > 0}
          onSubstitution={() => setView("substitution")}
          onViewProfile={() => {
            onViewProfile();
            handleClose();
          }}
          onMakeCaptain={() => {
            onMakeCaptain();
            handleClose();
          }}
          onMakeViceCaptain={() => {
            onMakeViceCaptain();
            handleClose();
          }}
          onRemove={() => {
            onRemove();
            handleClose();
          }}
          onCancel={handleClose}
        />
      ) : (
        <EmptySlotActions
          slot={slot}
          onAddPlayer={() => {
            onAddPlayer();
            handleClose();
          }}
          onSearchPlayer={() => {
            onSearchPlayer();
            handleClose();
          }}
          onCancel={handleClose}
        />
      )}
    </BottomSheet>
  );
}

function EmptySlotActions({
  slot,
  onAddPlayer,
  onSearchPlayer,
  onCancel,
}: {
  slot: SquadSlot;
  onAddPlayer: () => void;
  onSearchPlayer: () => void;
  onCancel: () => void;
}) {
  const label =
    slot.zone === "bench" ? "Bench" : slotLabel(slot.position, slot.zone);

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm text-[#081120]/50">
        {slot.zone === "starter" ? "Starting XI" : "Bench"} · {label}
      </p>

      <ActionButton icon={UserPlus} label="Assign Player" onClick={onAddPlayer} primary />
      <ActionButton icon={UserPlus} label="Add Player" onClick={onAddPlayer} />
      <ActionButton icon={Search} label="Search Player" onClick={onSearchPlayer} />

      <Button variant="outline" className="mt-2 h-12 w-full border-[#081120]/15" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

function FilledSlotActions({
  player,
  zoneLabel,
  isCaptain,
  isViceCaptain,
  hasSubstitutionTargets,
  onSubstitution,
  onViewProfile,
  onMakeCaptain,
  onMakeViceCaptain,
  onRemove,
  onCancel,
}: {
  player: FantasyPlayer;
  zoneLabel: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  hasSubstitutionTargets: boolean;
  onSubstitution: () => void;
  onViewProfile: () => void;
  onMakeCaptain: () => void;
  onMakeViceCaptain: () => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center pb-2">
        <FantasyPlayerCard player={player} size="bench" isCaptain={isCaptain} isViceCaptain={isViceCaptain} />
      </div>
      <p className="text-center text-xs text-[#081120]/45">
        {zoneLabel} · {player.position}
      </p>

      {hasSubstitutionTargets && (
        <ActionButton icon={ArrowLeftRight} label="Substitution" onClick={onSubstitution} primary />
      )}
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
      <ActionButton icon={Trash2} label="Remove Player" onClick={onRemove} danger />

      <Button variant="outline" className="h-12 w-full border-[#081120]/15" onClick={onCancel}>
        Close
      </Button>
    </div>
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
  const positionLabel =
    player.position === "GK"
      ? "goalkeeper"
      : player.position === "DEF"
        ? "defender"
        : player.position === "MID"
          ? "midfielder"
          : "attacker";

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

      <p className="text-sm text-[#081120]/60">
        Swap {player.name} with a {isStarter ? "bench" : "starting"} {positionLabel}
      </p>

      {targets.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#081120]/40">No players available to swap.</p>
      ) : (
        targets.map(({ slot: targetSlot, player: targetPlayer }) => (
          <button
            key={targetSlot.id}
            type="button"
            onClick={() => onSelect(targetSlot.id)}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#081120]/5 p-3 text-left active:scale-[0.98]"
          >
            <FantasyPlayerCard player={targetPlayer} size="bench" />
            <div>
              <p className="font-bold text-[#081120]">{targetPlayer.name}</p>
              <p className="text-xs text-[#081120]/50">{targetPlayer.totalPoints} pts</p>
            </div>
          </button>
        ))
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
      className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
        primary
          ? "bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#081120]"
          : danger
            ? "bg-[#E53935]/10 text-[#E53935]"
            : "bg-[#081120]/5 text-[#081120]"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </button>
  );
}
