"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [matchday, setMatchday] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [playerOutId, setPlayerOutId] = useState<string | null>(null);
  const [playerInId, setPlayerInId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    scrollRef.current?.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, power?.type]);

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
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        handleClose();
        router.refresh();
      })();
    });
  };

  if (!mounted || !open || !power) return null;

  const isWildcardManage =
    power.type === "WILDCARD" && data.wildcardActive && power.displayStatus !== "available";

  const formProps = {
    power,
    data,
    matchday,
    playerId,
    targetUserId,
    playerOutId,
    playerInId,
    onMatchday: setMatchday,
    onPlayer: setPlayerId,
    onTargetUser: setTargetUserId,
    onSelectOut: setPlayerOutId,
    onSelectIn: setPlayerInId,
    isWildcardManage,
  };

  const canSubmit = getCanSubmit(formProps);
  const submitLabel = getSubmitLabel(power, isWildcardManage);

  const handleSubmit = () => {
    if (isWildcardManage) {
      if (!playerOutId || !playerInId) {
        setError("Select a player to remove and one to add.");
        return;
      }
      run(() => wildcardTransferAction(playerInId, playerOutId));
      return;
    }
    submitPower(power.type, { matchday, playerId, targetUserId }, run);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#081120]"
      role="dialog"
      aria-modal="true"
      aria-label={`Activate ${power.name}`}
    >
      {/* Header — always visible at top */}
      <header className="shrink-0 border-b border-white/10 bg-[#081120]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Activate Power
            </p>
            <h1 className="truncate text-lg font-bold text-white">{power.name}</h1>
          </div>
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF]/20 to-[#00C853]/20 text-2xl"
            aria-hidden
          >
            {power.icon}
          </span>
        </div>
      </header>

      {/* Scrollable form — starts at top of visible area */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto max-w-lg space-y-4 p-4">
          <div className="rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5">
            <p className="text-sm leading-relaxed text-[#081120]/70">{power.description}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#081120]/35">
              Select options below, then confirm at the bottom
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-center text-sm font-medium text-[#E53935]">
              {error}
            </p>
          )}

          {isWildcardManage ? (
            <WildcardTransferFields {...formProps} />
          ) : (
            <ActivationFields {...formProps} />
          )}
        </div>
      </div>

      {/* Sticky footer — confirm always visible */}
      <footer className="shrink-0 border-t border-white/10 bg-[#081120]">
        <div className="mx-auto max-w-lg space-y-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            className="h-14 w-full text-base"
            disabled={!canSubmit || pending}
            onClick={handleSubmit}
          >
            {pending ? "Please wait…" : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border-white/15 bg-transparent text-white hover:bg-white/5"
            onClick={handleClose}
            disabled={pending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </footer>
    </div>,
    document.body
  );
}

function getSubmitLabel(power: PowerCardData, isWildcardManage: boolean): string {
  if (isWildcardManage) return "Make transfer";
  if (power.type === "LUCKY_DIP") return "Confirm Lucky Dip";
  return `Activate ${power.name}`;
}

type FormProps = {
  power: PowerCardData;
  data: PowersPageData;
  matchday: number | null;
  playerId: string | null;
  targetUserId: string | null;
  playerOutId: string | null;
  playerInId: string | null;
  onMatchday: (md: number) => void;
  onPlayer: (id: string | null) => void;
  onTargetUser: (id: string) => void;
  onSelectOut: (id: string) => void;
  onSelectIn: (id: string) => void;
  isWildcardManage: boolean;
};

function getCanSubmit({
  power,
  matchday,
  playerId,
  targetUserId,
  playerOutId,
  playerInId,
  isWildcardManage,
}: FormProps): boolean {
  if (isWildcardManage) return !!(playerOutId && playerInId);
  if (power.type === "LUCKY_DIP") return true;
  if (matchday == null) return false;
  if (power.type === "TRIPLE_CAPTAIN" || power.type === "WILDCARD") return true;
  if (power.type === "DOUBLE_POINTS") return !!playerId;
  if (power.type === "RIVAL_CHALLENGE") return !!targetUserId;
  if (power.type === "CURSE") return !!targetUserId && !!playerId;
  return false;
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

function ActivationFields({
  power,
  data,
  matchday,
  playerId,
  targetUserId,
  onMatchday,
  onPlayer,
  onTargetUser,
}: FormProps) {
  const needsMatchday = power.type !== "LUCKY_DIP";
  const needsPlayer = power.type === "DOUBLE_POINTS" || power.type === "CURSE";
  const needsOpponent = power.type === "RIVAL_CHALLENGE" || power.type === "CURSE";
  const showPlayers =
    needsPlayer &&
    (power.type !== "CURSE" || (targetUserId && data.opponentSquads[targetUserId]));

  const playersForSelect =
    power.type === "CURSE" && targetUserId
      ? data.opponentSquads[targetUserId] ?? []
      : data.squadPlayers;

  return (
    <div className="space-y-4">
      {needsMatchday && (
        <Section title="Select matchday">
          {data.openMatchdays.length === 0 ? (
            <p className="text-sm text-white/50">No open matchdays available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.openMatchdays.map((md) => (
                <button
                  key={md}
                  type="button"
                  onClick={() => onMatchday(md)}
                  className={cn(
                    "min-h-[44px] rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.97]",
                    matchday === md
                      ? "bg-[#0066FF] text-white shadow-sm"
                      : "bg-white/10 text-white/80"
                  )}
                >
                  Matchday {md}
                </button>
              ))}
            </div>
          )}
        </Section>
      )}

      {needsOpponent && (
        <Section title="Select manager">
          {data.otherUsers.length === 0 ? (
            <p className="text-sm text-white/50">No other managers in the league.</p>
          ) : (
            <div className="space-y-1.5">
              {data.otherUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onTargetUser(u.id);
                    onPlayer(null);
                  }}
                  className={cn(
                    "flex w-full min-h-[48px] items-center rounded-xl px-4 text-left text-sm font-semibold transition-all active:scale-[0.99]",
                    targetUserId === u.id
                      ? "bg-[#0066FF] text-white"
                      : "bg-white/10 text-white/85"
                  )}
                >
                  {u.teamName}
                </button>
              ))}
            </div>
          )}
        </Section>
      )}

      {showPlayers && playersForSelect.length > 0 && (
        <Section title="Select player">
          <div className="space-y-1.5">
            {playersForSelect.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPlayer(p.id)}
                className={cn(
                  "flex w-full min-h-[48px] items-center rounded-xl px-4 text-left text-sm font-semibold transition-all active:scale-[0.99]",
                  playerId === p.id
                    ? "bg-[#0066FF] text-white"
                    : "bg-white/10 text-white/85"
                )}
              >
                {"position" in p ? `${p.name} · ${p.position}` : p.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {power.type === "LUCKY_DIP" && (
        <p className="rounded-xl bg-[#FFD700]/12 px-4 py-3 text-sm text-[#FFD700]/90 ring-1 ring-[#FFD700]/25">
          Two random players will be swapped permanently — one from your squad and
          one from another manager.
        </p>
      )}
    </div>
  );
}

function WildcardTransferFields({
  data,
  playerOutId,
  playerInId,
  onSelectOut,
  onSelectIn,
}: FormProps) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-[#00C853]/12 px-4 py-3 text-sm text-[#00C853] ring-1 ring-[#00C853]/25">
        Wildcard active for Matchday {data.wildcardMatchday}. Transfers lock when the
        matchday starts. Only unassigned draft players can be added.
      </p>

      <Section title="Remove from your squad">
        <div className="space-y-1.5">
          {data.squadPlayers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectOut(p.id)}
              className={cn(
                "w-full min-h-[48px] rounded-xl px-4 text-left text-sm font-semibold transition-all active:scale-[0.99]",
                playerOutId === p.id
                  ? "bg-[#E53935]/20 text-[#E53935]"
                  : "bg-white/10 text-white/85"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Add from draft pool">
        {data.unassignedPlayers.length === 0 ? (
          <p className="text-sm text-white/50">No unassigned players available.</p>
        ) : (
          <div className="space-y-1.5">
            {data.unassignedPlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectIn(p.id)}
                className={cn(
                  "w-full min-h-[48px] rounded-xl px-4 text-left text-sm font-semibold transition-all active:scale-[0.99]",
                  playerInId === p.id
                    ? "bg-[#00C853]/20 text-[#00C853]"
                    : "bg-white/10 text-white/85"
                )}
              >
                {p.name} · {p.position}
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
        {title}
      </p>
      {children}
    </div>
  );
}
