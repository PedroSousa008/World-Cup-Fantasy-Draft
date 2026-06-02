"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Crown,
  User,
  Trash2,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import { getPositionLabel } from "@/lib/players/types";
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

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={view === "substitution" ? "Substitute" : player.name}
      className="z-[105]"
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
        <FilledSlotActions
          player={player}
          slot={slot}
          zoneLabel={slot.zone === "starter" ? "Starting XI" : "Bench"}
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
      )}
    </BottomSheet>
  );
}

function FilledSlotActions({
  player,
  slot,
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
  slot: SquadSlot;
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
        <FantasyPlayerCard
          player={player}
          size="bench"
          isCaptain={isCaptain}
          isViceCaptain={isViceCaptain}
        />
      </div>
      <p className="text-center text-xs text-[#081120]/45">
        {zoneLabel} · {getPositionLabel(player.position)}
      </p>

      {hasSubstitutionTargets && (
        <ActionButton
          icon={ArrowLeftRight}
          label="Substitute"
          onClick={onSubstitution}
          primary
        />
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
      {slot.zone === "starter" && (
        <ActionButton icon={Trash2} label="Remove from lineup" onClick={onRemove} danger />
      )}
      {slot.zone === "bench" && (
        <ActionButton icon={Trash2} label="Remove from bench" onClick={onRemove} danger />
      )}

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

      <p className="text-sm text-[#081120]/60">
        Swap {player.name} with a {isStarter ? "bench" : "starting XI"} {positionLabel}
      </p>

      {targets.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#081120]/40">
          No {positionLabel}s available to swap.
        </p>
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
