"use client";

import { useMemo, useState, useTransition } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import { getRoundLabel } from "@/lib/tournament/knockout/topology";
import type { KnockoutRound } from "@prisma/client";
import type {
  BracketMatchState,
  BracketSlotState,
  BracketNation,
  KnockoutBracketData,
} from "@/lib/tournament/knockout/bracket-service";
import {
  assignKnockoutSlotAction,
  setKnockoutWinnerAction,
} from "@/lib/actions/owner/knockout-bracket";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";

interface KnockoutBracketViewProps {
  data: KnockoutBracketData;
  editable?: boolean;
  onMutated?: () => void;
}

export function KnockoutBracketView({
  data,
  editable = false,
  onMutated,
}: KnockoutBracketViewProps) {
  const slotMap = useMemo(
    () => new Map(data.slots.map((s) => [s.slotKey, s])),
    [data.slots]
  );
  const {
    leftR32,
    leftR16,
    leftQF,
    leftSF,
    rightR32,
    rightR16,
    rightQF,
    rightSF,
    finalMatch,
  } = useMemo(() => {
    const leftR32: BracketMatchState[] = [];
    const leftR16: BracketMatchState[] = [];
    const leftQF: BracketMatchState[] = [];
    const leftSF: BracketMatchState[] = [];
    const rightR32: BracketMatchState[] = [];
    const rightR16: BracketMatchState[] = [];
    const rightQF: BracketMatchState[] = [];
    const rightSF: BracketMatchState[] = [];
    let finalMatch: BracketMatchState | undefined;

    for (const m of data.matches) {
      if (m.round === "FINAL") {
        finalMatch = m;
        continue;
      }
      if (m.side === "left") {
        if (m.round === "ROUND_OF_32") leftR32.push(m);
        else if (m.round === "ROUND_OF_16") leftR16.push(m);
        else if (m.round === "QUARTER_FINALS") leftQF.push(m);
        else if (m.round === "SEMI_FINALS") leftSF.push(m);
      } else if (m.side === "right") {
        if (m.round === "ROUND_OF_32") rightR32.push(m);
        else if (m.round === "ROUND_OF_16") rightR16.push(m);
        else if (m.round === "QUARTER_FINALS") rightQF.push(m);
        else if (m.round === "SEMI_FINALS") rightSF.push(m);
      }
    }
    return {
      leftR32,
      leftR16,
      leftQF,
      leftSF,
      rightR32,
      rightR16,
      rightQF,
      rightSF,
      finalMatch,
    };
  }, [data.matches]);

  const champion = slotMap.get("champion");

  return (
    <div className="knockout-bracket-root space-y-4">
      {editable && (
        <p className="text-sm text-white/55">
          Tap Round of 32 slots to add teams. Tap a match to pick the winner — or enter results
          under Matches (MD 4–8). Winners advance automatically.
        </p>
      )}

      <div className="knockout-bracket-scroll overflow-x-auto overflow-y-hidden rounded-2xl border border-[#E53935]/30 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#081120] p-4 shadow-[inset_0_0_80px_rgba(0,40,100,0.35)]">
        <div className="knockout-bracket-inner flex min-w-[1100px] items-stretch gap-2 pb-4">
          <BracketSide
            matches={[leftR32, leftR16, leftQF, leftSF]}
            slotMap={slotMap}
            editable={editable}
            nations={data.nations}
            align="left"
            onMutated={onMutated}
          />

          <div className="flex w-[140px] shrink-0 flex-col items-center justify-center gap-6 px-2">
            <RoundColumn label="Final" className="items-center">
              {finalMatch && (
                <MatchPair
                  match={finalMatch}
                  slotMap={slotMap}
                  editable={editable}
                  nations={data.nations}
                  compact
                  onMutated={onMutated}
                />
              )}
            </RoundColumn>
            <div className="flex flex-col items-center gap-2">
              <Trophy className="h-10 w-10 text-[#FFD700]/80" />
              <ChampionSlot
                slot={champion}
                editable={false}
              />
            </div>
          </div>

          <BracketSide
            matches={[rightR32, rightR16, rightQF, rightSF]}
            slotMap={slotMap}
            editable={editable}
            nations={data.nations}
            align="right"
            onMutated={onMutated}
          />
        </div>
      </div>
    </div>
  );
}

function BracketSide({
  matches,
  slotMap,
  editable,
  nations,
  align,
  onMutated,
}: {
  matches: BracketMatchState[][];
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  align: "left" | "right";
  onMutated?: () => void;
}) {
  const labels = ["Round of 32", "Round of 16", "Quarter Finals", "Semi Finals"];

  return (
    <div
      className={cn(
        "flex flex-1 gap-3",
        align === "right" && "flex-row-reverse"
      )}
    >
      {matches.map((roundMatches, i) => (
        <RoundColumn key={labels[i]} label={labels[i]}>
          {roundMatches.map((m) => (
            <MatchPair
              key={m.matchKey}
              match={m}
              slotMap={slotMap}
              editable={editable}
              nations={nations}
              onMutated={onMutated}
            />
          ))}
        </RoundColumn>
      ))}
    </div>
  );
}

function RoundColumn({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-center text-[10px] font-bold uppercase tracking-wider text-[#E53935]/90">
        {label}
      </span>
      <div className="flex flex-1 flex-col justify-around gap-3">{children}</div>
    </div>
  );
}

function MatchPair({
  match,
  slotMap,
  editable,
  nations,
  compact,
  onMutated,
}: {
  match: BracketMatchState;
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  compact?: boolean;
  onMutated?: () => void;
}) {
  const home = slotMap.get(match.homeSlot);
  const away = slotMap.get(match.awaySlot);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const canPickWinner = Boolean(
    editable && home?.nationalTeamId && away?.nationalTeamId
  );

  return (
    <div
      className={cn(
        "knockout-match-pair flex flex-col gap-1",
        compact && "gap-0.5",
        canPickWinner && "cursor-pointer"
      )}
      onClick={() => canPickWinner && setWinnerOpen(true)}
      onKeyDown={(e) => {
        if (canPickWinner && (e.key === "Enter" || e.key === " ")) setWinnerOpen(true);
      }}
      role={canPickWinner ? "button" : undefined}
      tabIndex={canPickWinner ? 0 : undefined}
    >
      <TeamSlot
        slot={home}
        slotKey={match.homeSlot}
        editable={editable && match.round === "ROUND_OF_32"}
        isWinner={match.winnerId === home?.nationalTeamId}
        isLoser={
          Boolean(match.winnerId && home?.nationalTeamId && match.winnerId !== home.nationalTeamId)
        }
        compact={compact}
        onSelect={() => {
          setActiveSlot(match.homeSlot);
          setPickerOpen(true);
        }}
      />
      <div className="mx-auto h-3 w-px bg-[#E53935]/70" title={canPickWinner ? "Tap to pick winner" : undefined} />
      <TeamSlot
        slot={away}
        slotKey={match.awaySlot}
        editable={editable && match.round === "ROUND_OF_32"}
        isWinner={match.winnerId === away?.nationalTeamId}
        isLoser={
          Boolean(match.winnerId && away?.nationalTeamId && match.winnerId !== away.nationalTeamId)
        }
        compact={compact}
        onSelect={() => {
          setActiveSlot(match.awaySlot);
          setPickerOpen(true);
        }}
      />

      {editable && match.round === "ROUND_OF_32" && (
        <NationPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          nations={nations}
          currentId={activeSlot ? slotMap.get(activeSlot)?.nationalTeamId : null}
          onPick={async (id) => {
            if (activeSlot) await assignKnockoutSlotAction(activeSlot, id);
            setPickerOpen(false);
            onMutated?.();
          }}
          onClear={async () => {
            if (activeSlot) await assignKnockoutSlotAction(activeSlot, null);
            setPickerOpen(false);
            onMutated?.();
          }}
        />
      )}

      {editable && (
        <WinnerPickerModal
          open={winnerOpen}
          onClose={() => setWinnerOpen(false)}
          match={match}
          home={home}
          away={away}
          onPick={async (winnerId) => {
            await setKnockoutWinnerAction(match.matchKey, winnerId);
            setWinnerOpen(false);
            onMutated?.();
          }}
        />
      )}
    </div>
  );
}

function TeamSlot({
  slot,
  slotKey,
  editable,
  isWinner,
  isLoser,
  compact,
  onSelect,
}: {
  slot?: BracketSlotState;
  slotKey: string;
  editable: boolean;
  isWinner: boolean;
  isLoser: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const nation = slot?.nation;
  const canEdit = editable && slotKey.startsWith("r32-");

  return (
    <button
      type="button"
      disabled={!canEdit}
        onClick={(e) => {
          e.stopPropagation();
          if (canEdit) onSelect();
        }}
      className={cn(
        "knockout-team-slot flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg border-2 border-[#E53935] bg-[#0a1628]/90 px-2 py-1.5 text-center transition-all",
        compact ? "min-w-[88px] py-1 text-xs" : "min-w-[108px] py-2 text-sm",
        canEdit && "cursor-pointer hover:border-[#ff6b6b] hover:bg-[#122a4d]",
        !canEdit && "cursor-default",
        isWinner && "shadow-[0_0_12px_rgba(255,255,255,0.35)] ring-1 ring-white/40",
        isLoser && "opacity-40 grayscale",
        !isWinner && !isLoser && "opacity-100"
      )}
    >
      {nation ? (
        <>
          <span className="text-lg leading-none">
            {nation.flagEmoji ?? getNationFlag(nation.name)}
          </span>
          {!compact && (
            <span className="truncate font-semibold text-white">{nation.code}</span>
          )}
        </>
      ) : (
        <span className="text-xs font-medium text-white/45">
          {canEdit ? "+ Select Team" : "—"}
        </span>
      )}
    </button>
  );
}

function ChampionSlot({ slot }: { slot?: BracketSlotState; editable: boolean }) {
  const nation = slot?.nation;
  return (
    <div
      className={cn(
        "flex min-w-[120px] flex-col items-center gap-1 rounded-xl border-2 border-[#FFD700] bg-gradient-to-b from-[#FFD700]/20 to-[#B8860B]/10 px-4 py-3 shadow-[0_0_24px_rgba(255,215,0,0.25)]",
        nation && "ring-2 ring-[#FFD700]/50"
      )}
    >
      {nation ? (
        <>
          <span className="text-3xl">{nation.flagEmoji ?? getNationFlag(nation.name)}</span>
          <span className="text-sm font-black text-[#FFD700]">🏆 {nation.name}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]/70">
            Champion
          </span>
        </>
      ) : (
        <span className="text-xs text-white/40">Champion TBD</span>
      )}
    </div>
  );
}

function NationPickerModal({
  open,
  onClose,
  nations,
  currentId,
  onPick,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  nations: BracketNation[];
  currentId: string | null | undefined;
  onPick: (id: string) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");

  const filtered = nations.filter(
    (n) =>
      n.name.toLowerCase().includes(q.toLowerCase()) ||
      n.code.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <MobileFullScreenModal open={open} onClose={onClose} title="Select nation">
      <input
        type="search"
        placeholder="Search nations…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-3 w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-white ring-1 ring-white/15"
      />
      {currentId && (
        <button
          type="button"
          onClick={onClear}
          className="mb-3 w-full rounded-xl bg-[#E53935]/20 py-2 text-sm font-semibold text-[#FF8A80]"
        >
          Remove team from slot
        </button>
      )}
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onPick(n.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-white/5 p-2.5 text-left ring-1 ring-white/10 active:scale-[0.98]",
                currentId === n.id && "ring-[#00C853]"
              )}
            >
              <span className="text-xl">{n.flagEmoji ?? getNationFlag(n.name)}</span>
              <span className="truncate text-sm font-semibold text-white">{n.name}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileFullScreenModal>
  );
}

function WinnerPickerModal({
  open,
  onClose,
  match,
  home,
  away,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  match: BracketMatchState;
  home?: BracketSlotState;
  away?: BracketSlotState;
  onPick: (winnerId: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  if (!home?.nation || !away?.nation) return null;

  return (
    <MobileFullScreenModal
      open={open}
      onClose={onClose}
      title={getRoundLabel(match.round as KnockoutRound)}
      subtitle="Select winner"
    >
      <div className="flex flex-col gap-3">
        {[home, away].map((side) => (
          <button
            key={side.nationalTeamId!}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => onPick(side.nationalTeamId!))
            }
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 active:scale-[0.98]"
          >
            <span className="text-3xl">
              {side.nation!.flagEmoji ?? getNationFlag(side.nation!.name)}
            </span>
            <span className="font-bold text-white">{side.nation!.name}</span>
          </button>
        ))}
      </div>
    </MobileFullScreenModal>
  );
}
