"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import { getNationFlag } from "@/lib/mock/my-team-data";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { SquadSlot } from "@/lib/squad/formations";

interface SubstitutionPanelProps {
  player: FantasyPlayer;
  slot: SquadSlot;
  targets: { slot: SquadSlot; player: FantasyPlayer }[];
  onSubstitute: (targetSlotId: string) => void;
  onBack: () => void;
}

export function SubstitutionPanel({
  player,
  slot,
  targets,
  onSubstitute,
  onBack,
}: SubstitutionPanelProps) {
  const isStarter = slot.zone === "starter";
  const positionLabel =
    player.position === "GK"
      ? "Goalkeeper"
      : player.position === "DEF"
        ? "Defender"
        : player.position === "MID"
          ? "Midfielder"
          : "Attacker";

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#081120]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs text-white/45">Substitution</p>
          <p className="font-bold text-white">{player.name}</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-xl bg-white/5 px-4 py-3">
          <p className="text-xs text-white/50">
            {isStarter ? "Starting" : "Bench"} {positionLabel} · {positionLabel} swaps only
          </p>
          <p className="mt-1 text-sm font-semibold text-[#FFD700]">
            Select a {isStarter ? "bench" : "starting"} {positionLabel.toLowerCase()} to swap
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
        {targets.length === 0 ? (
          <div className="py-12 text-center">
            <ArrowLeftRight className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-3 text-sm text-white/40">
              No {isStarter ? "bench" : "starting"} {positionLabel.toLowerCase()}s available to swap.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {targets.map(({ slot: targetSlot, player: targetPlayer }) => (
              <button
                key={targetSlot.id}
                type="button"
                onClick={() => onSubstitute(targetSlot.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-3 text-left transition-all active:scale-[0.98]"
              >
                <FantasyPlayerCard player={targetPlayer} size="bench" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{targetPlayer.name}</p>
                  <p className="text-xs text-white/50">
                    {getNationFlag(targetPlayer.nation)} {targetPlayer.position} ·{" "}
                    {targetPlayer.totalPoints} pts
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#FFD700]">
                    Swap with {player.name.split(" ").pop()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerDetailViewProps {
  player: FantasyPlayer;
  slot: SquadSlot;
  isCaptain: boolean;
  isViceCaptain: boolean;
  substitutionTargets: { slot: SquadSlot; player: FantasyPlayer }[];
  readOnly?: boolean;
  backHref?: string;
  ownerTeamName?: string | null;
  minutesPlayed?: number;
  ownGoals?: number;
  onMakeCaptain: () => void;
  onMakeViceCaptain: () => void;
  onRemove: () => void;
  onSubstitute: (targetSlotId: string) => void;
}

export function PlayerDetailView({
  player,
  slot,
  isCaptain,
  isViceCaptain,
  substitutionTargets,
  readOnly = false,
  backHref = "/my-team/team",
  ownerTeamName,
  minutesPlayed = 0,
  ownGoals = 0,
  onMakeCaptain,
  onMakeViceCaptain,
  onRemove,
  onSubstitute,
}: PlayerDetailViewProps) {
  const router = useRouter();
  const [showSubstitution, setShowSubstitution] = useState(false);
  const isStarter = slot.zone === "starter";

  return (
    <>
      <div className="min-h-[100dvh] bg-[#081120] pb-8">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#081120]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-white/45">Player Profile</p>
            <p className="font-bold text-white">{player.name}</p>
          </div>
        </div>

        <div className="space-y-5 px-4 pt-5">
          <FantasyPlayerCard
            player={player}
            size="full"
            isCaptain={isCaptain}
            isViceCaptain={isViceCaptain}
          />

          <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-[#081120]">{player.name}</p>
                <p className="text-sm text-[#081120]/60">
                  {getNationFlag(player.nation)} {player.nation} · {player.position} · {player.club}
                </p>
                {ownerTeamName && (
                  <p className="mt-1 text-xs font-semibold text-[#0066FF]">
                    Owned by {ownerTeamName}
                  </p>
                )}
              </div>
              {isCaptain && (
                <span className="rounded-full bg-gradient-to-r from-[#FFD700] to-[#B8860B] px-3 py-1 text-xs font-black text-[#081120]">
                  Captain · 2×
                </span>
              )}
              {isViceCaptain && !isCaptain && (
                <span className="rounded-full bg-[#081120] px-3 py-1 text-xs font-black text-[#FFD700]">
                  Vice-Captain
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/95 p-4 text-center shadow-lg">
              <p className="text-3xl font-black text-[#0066FF]">{player.totalPoints}</p>
              <p className="text-xs font-semibold text-[#081120]/50">Total Points</p>
            </div>
            <div className="rounded-2xl bg-white/95 p-4 text-center shadow-lg">
              <p className="text-3xl font-black text-[#00C853]">{player.matchdayPoints}</p>
              <p className="text-xs font-semibold text-[#081120]/50">Matchday Points</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#081120]/40">
              Statistics
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Goals", value: player.goals },
                { label: "Assists", value: player.assists },
                { label: "Minutes", value: minutesPlayed },
                { label: "Yellow Cards", value: player.yellowCards },
                { label: "Red Cards", value: player.redCards },
                { label: "Own Goals", value: ownGoals },
                { label: "MOTM", value: player.motmAwards },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-[#081120]/5 py-3 text-center">
                  <p className="text-xl font-black text-[#081120]">{stat.value}</p>
                  <p className="text-[10px] text-[#081120]/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#081120]/40">
              Upcoming Match
            </p>
            <p className="text-lg font-bold text-[#081120]">{player.upcomingFixture}</p>
            {player.matchDate && <p className="text-sm text-[#081120]/50">{player.matchDate}</p>}
          </div>

          <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#081120]/40">
              Match History
            </p>
            {player.matchHistory.length === 0 ? (
              <p className="text-sm text-[#081120]/40">No matches played yet.</p>
            ) : (
              player.matchHistory.map((m) => (
                <div
                  key={m.matchday}
                  className="flex justify-between border-b border-[#081120]/5 py-2.5 last:border-0"
                >
                  <span className="text-sm text-[#081120]/60">
                    MD{m.matchday} vs {m.opponent}
                  </span>
                  <span className="font-bold text-[#081120]">{m.points} pts</span>
                </div>
              ))
            )}
          </div>

          {!readOnly && (
            <div className="grid grid-cols-2 gap-2 pb-4">
              <Button
                className="col-span-2 h-14 bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#081120] hover:opacity-90"
                onClick={() => setShowSubstitution(true)}
              >
                Substitution
              </Button>
              <Button
                variant={isCaptain ? "primary" : "outline"}
                className={!isCaptain ? "border-[#081120]/15 text-[#081120]" : ""}
                onClick={onMakeCaptain}
                disabled={isCaptain}
              >
                {isCaptain ? "Captain ✓" : "Make Captain"}
              </Button>
              <Button
                variant="outline"
                className="border-[#081120]/15 text-[#081120]"
                onClick={onMakeViceCaptain}
                disabled={isViceCaptain}
              >
                {isViceCaptain ? "Vice-Cap ✓" : "Make Vice-Cap"}
              </Button>
              <Button variant="danger" className="col-span-2" onClick={onRemove}>
                Remove from {isStarter ? "Starting XI" : "Bench"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {showSubstitution && (
        <SubstitutionPanel
          player={player}
          slot={slot}
          targets={substitutionTargets}
          onSubstitute={(targetSlotId) => {
            onSubstitute(targetSlotId);
            setShowSubstitution(false);
            router.push("/my-team/team");
          }}
          onBack={() => setShowSubstitution(false)}
        />
      )}
    </>
  );
}
