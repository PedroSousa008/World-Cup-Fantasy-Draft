"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  activateCurseAction,
  activateDoublePointsAction,
  activateLuckyDipAction,
  activateTripleCaptainAction,
  activateWildcardAction,
  sendRivalChallengeAction,
  wildcardTransferAction,
} from "@/lib/actions/powers";
import type { PowerCardData, PowersPageData } from "@/lib/powers/types";
import type { PowerType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface PowerActivateSheetProps {
  power: PowerCardData | null;
  data: PowersPageData;
  open: boolean;
  onClose: () => void;
}

export function PowerActivateSheet({
  power,
  data,
  open,
  onClose,
}: PowerActivateSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [matchday, setMatchday] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [playerOutId, setPlayerOutId] = useState<string | null>(null);
  const [playerInId, setPlayerInId] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setMatchday(null);
    setPlayerId(null);
    setTargetUserId(null);
    setPlayerOutId(null);
    setPlayerInId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await fn();
        if (!result.ok) {
          setError(result.error ?? "Something went wrong");
          return;
        }
        handleClose();
        router.refresh();
      })();
    });
  };

  if (!power) return null;

  const isWildcardManage =
    power.type === "WILDCARD" && data.wildcardActive && power.displayStatus !== "available";

  return (
    <BottomSheet open={open} onClose={handleClose} title={power.name}>
      <div className="space-y-4">
        <p className="text-center text-sm text-[#081120]/65">{power.description}</p>

        {error && (
          <p className="rounded-xl bg-[#E53935]/10 px-3 py-2 text-center text-xs font-medium text-[#E53935]">
            {error}
          </p>
        )}

        {isWildcardManage ? (
          <WildcardTransferForm
            data={data}
            playerOutId={playerOutId}
            playerInId={playerInId}
            onSelectOut={setPlayerOutId}
            onSelectIn={setPlayerInId}
            onSubmit={() => {
              if (!playerOutId || !playerInId) {
                setError("Select a player to remove and one to add.");
                return;
              }
              run(() => wildcardTransferAction(playerInId, playerOutId));
            }}
            pending={pending}
          />
        ) : (
          <ActivationForm
            power={power}
            data={data}
            matchday={matchday}
            playerId={playerId}
            targetUserId={targetUserId}
            onMatchday={setMatchday}
            onPlayer={setPlayerId}
            onTargetUser={setTargetUserId}
            onSubmit={() => submitPower(power.type, { matchday, playerId, targetUserId }, run)}
            pending={pending}
          />
        )}
      </div>
    </BottomSheet>
  );
}

function submitPower(
  type: PowerType,
  vals: {
    matchday: number | null;
    playerId: string | null;
    targetUserId: string | null;
  },
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => void
) {
  switch (type) {
    case "DOUBLE_POINTS": {
      const md = vals.matchday;
      const pid = vals.playerId;
      if (md == null || !pid) return;
      run(() => activateDoublePointsAction(md, pid));
      break;
    }
    case "TRIPLE_CAPTAIN": {
      const md = vals.matchday;
      if (md == null) return;
      run(() => activateTripleCaptainAction(md));
      break;
    }
    case "RIVAL_CHALLENGE": {
      const md = vals.matchday;
      const uid = vals.targetUserId;
      if (md == null || !uid) return;
      run(() => sendRivalChallengeAction(uid, md));
      break;
    }
    case "LUCKY_DIP":
      run(() => activateLuckyDipAction());
      break;
    case "WILDCARD": {
      const md = vals.matchday;
      if (md == null) return;
      run(() => activateWildcardAction(md));
      break;
    }
    case "CURSE": {
      const md = vals.matchday;
      const uid = vals.targetUserId;
      const pid = vals.playerId;
      if (md == null || !uid || !pid) return;
      run(() => activateCurseAction(md, uid, pid));
      break;
    }
  }
}

function ActivationForm({
  power,
  data,
  matchday,
  playerId,
  targetUserId,
  onMatchday,
  onPlayer,
  onTargetUser,
  onSubmit,
  pending,
}: {
  power: PowerCardData;
  data: PowersPageData;
  matchday: number | null;
  playerId: string | null;
  targetUserId: string | null;
  onMatchday: (md: number) => void;
  onPlayer: (id: string | null) => void;
  onTargetUser: (id: string) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  const needsMatchday = power.type !== "LUCKY_DIP";
  const needsPlayer =
    power.type === "DOUBLE_POINTS" || power.type === "CURSE";
  const needsOpponent =
    power.type === "RIVAL_CHALLENGE" || power.type === "CURSE";
  const showPlayers =
    needsPlayer &&
    (power.type !== "CURSE" || (targetUserId && data.opponentSquads[targetUserId]));

  const playersForSelect =
    power.type === "CURSE" && targetUserId
      ? data.opponentSquads[targetUserId] ?? []
      : data.squadPlayers;

  const canSubmit =
    power.type === "LUCKY_DIP" ||
    (needsMatchday &&
      matchday != null &&
      (!needsOpponent || targetUserId) &&
      (!needsPlayer || playerId));

  return (
    <>
      {needsMatchday && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">
            Select matchday
          </p>
          <div className="flex flex-wrap gap-2">
            {data.openMatchdays.length === 0 ? (
              <p className="text-sm text-[#081120]/50">No open matchdays.</p>
            ) : (
              data.openMatchdays.map((md) => (
                <button
                  key={md}
                  type="button"
                  onClick={() => onMatchday(md)}
                  className={cn(
                    "min-h-[40px] rounded-xl px-4 text-sm font-bold",
                    matchday === md
                      ? "bg-[#0066FF] text-white"
                      : "bg-[#081120]/5 text-[#081120]"
                  )}
                >
                  MD {md}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {needsOpponent && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">
            Select manager
          </p>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {data.otherUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onTargetUser(u.id);
                  onPlayer(null);
                }}
                className={cn(
                  "flex w-full min-h-[44px] items-center rounded-xl px-3 text-left text-sm font-semibold",
                  targetUserId === u.id
                    ? "bg-[#0066FF] text-white"
                    : "bg-[#081120]/5 text-[#081120]"
                )}
              >
                {u.teamName}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPlayers && playersForSelect.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">
            Select player
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {playersForSelect.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPlayer(p.id)}
                className={cn(
                  "flex w-full min-h-[44px] items-center rounded-xl px-3 text-left text-sm font-semibold",
                  playerId === p.id
                    ? "bg-[#0066FF] text-white"
                    : "bg-[#081120]/5 text-[#081120]"
                )}
              >
                {"position" in p ? `${p.name} · ${p.position}` : p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {power.type === "LUCKY_DIP" && (
        <p className="rounded-xl bg-[#FFD700]/10 px-3 py-2 text-xs text-[#081120]/70">
          Two random players will be swapped permanently — yours for one from
          another manager.
        </p>
      )}

      <Button
        className="h-14 w-full"
        disabled={!canSubmit || pending}
        onClick={onSubmit}
      >
        {power.type === "LUCKY_DIP" ? "Confirm Lucky Dip" : `Activate ${power.name}`}
      </Button>
    </>
  );
}

function WildcardTransferForm({
  data,
  playerOutId,
  playerInId,
  onSelectOut,
  onSelectIn,
  onSubmit,
  pending,
}: {
  data: PowersPageData;
  playerOutId: string | null;
  playerInId: string | null;
  onSelectOut: (id: string) => void;
  onSelectIn: (id: string) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <>
      <p className="rounded-xl bg-[#00C853]/10 px-3 py-2 text-xs font-medium text-[#00A844]">
        Wildcard active — Matchday {data.wildcardMatchday}. Transfers lock when the
        matchday starts.
      </p>

      <div>
        <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">Remove</p>
        <div className="max-h-32 space-y-1 overflow-y-auto">
          {data.squadPlayers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectOut(p.id)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold",
                playerOutId === p.id ? "bg-[#E53935]/15 text-[#E53935]" : "bg-[#081120]/5"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">
          Add (unassigned only)
        </p>
        {data.unassignedPlayers.length === 0 ? (
          <p className="text-sm text-[#081120]/50">No unassigned players available.</p>
        ) : (
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {data.unassignedPlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectIn(p.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold",
                  playerInId === p.id ? "bg-[#00C853]/15 text-[#00A844]" : "bg-[#081120]/5"
                )}
              >
                {p.name} · {p.position}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button className="h-14 w-full" disabled={pending} onClick={onSubmit}>
        Make transfer
      </Button>
    </>
  );
}
