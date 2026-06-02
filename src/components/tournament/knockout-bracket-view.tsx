"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import { getBracketTreeGroups, getRoundLabel } from "@/lib/tournament/knockout/topology";
import type { KnockoutRound } from "@prisma/client";
import type {
  BracketMatchState,
  BracketSlotState,
  BracketNation,
  KnockoutBracketData,
} from "@/lib/tournament/knockout/bracket-service";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";

interface KnockoutBracketViewProps {
  data: KnockoutBracketData;
  editable?: boolean;
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
}

export function KnockoutBracketView({
  data,
  editable = false,
  onAssignSlot,
  onSetWinner,
}: KnockoutBracketViewProps) {
  const slotMap = useMemo(
    () => new Map(data.slots.map((s) => [s.slotKey, s])),
    [data.slots]
  );

  const matchByKey = useMemo(
    () => new Map(data.matches.map((m) => [m.matchKey, m])),
    [data.matches]
  );

  const finalMatch = useMemo(
    () => data.matches.find((m) => m.round === "FINAL"),
    [data.matches]
  );

  const championNation = useMemo(() => {
    if (!finalMatch?.winnerId) return null;
    if (finalMatch.homeNation?.id === finalMatch.winnerId) return finalMatch.homeNation;
    if (finalMatch.awayNation?.id === finalMatch.winnerId) return finalMatch.awayNation;
    return null;
  }, [finalMatch]);

  return (
    <div className="knockout-bracket-root space-y-4">
      {editable && (
        <p className="text-sm text-white/55">
          Tap Round of 32 slots to add teams. Tap a match to pick the winner — or enter results
          under Matches (MD 4–8). Winners advance automatically through the tree.
        </p>
      )}

      <div className="knockout-bracket-scroll overflow-x-auto overflow-y-hidden rounded-2xl border border-[#E53935]/30 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#081120] p-4 shadow-[inset_0_0_80px_rgba(0,40,100,0.35)]">
        <div className="knockout-bracket-inner flex min-w-[1200px] items-stretch gap-1 pb-4">
          <BracketTreeSide
            side="left"
            matchByKey={matchByKey}
            slotMap={slotMap}
            editable={editable}
            nations={data.nations}
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
          />

          <div className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-6 px-2">
            <RoundColumn label="Final" className="items-center">
              {finalMatch && (
                <BracketTreeGroup
                  match={finalMatch}
                  feederMatches={[]}
                  slotMap={slotMap}
                  editable={editable}
                  nations={data.nations}
                  compact
                  onAssignSlot={onAssignSlot}
                  onSetWinner={onSetWinner}
                />
              )}
            </RoundColumn>
            <div className="flex flex-col items-center gap-2">
              <Trophy className="h-10 w-10 text-[#FFD700]/80" />
              <ChampionDisplay nation={championNation} />
            </div>
          </div>

          <BracketTreeSide
            side="right"
            matchByKey={matchByKey}
            slotMap={slotMap}
            editable={editable}
            nations={data.nations}
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
          />
        </div>
      </div>
    </div>
  );
}

function BracketTreeSide({
  side,
  matchByKey,
  slotMap,
  editable,
  nations,
  onAssignSlot,
  onSetWinner,
}: {
  side: "left" | "right";
  matchByKey: Map<string, BracketMatchState>;
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
}) {
  const rounds = useMemo(() => getBracketTreeGroups(side), [side]);

  return (
    <div
      className={cn(
        "flex flex-1 gap-2",
        side === "right" && "flex-row-reverse"
      )}
    >
      {rounds.map((round) => (
        <RoundColumn key={round.label} label={round.label}>
          {round.groups.map((group) => {
            const match = matchByKey.get(group.match.key);
            if (!match) return null;
            const feeders = group.feederMatches
              .map((f) => matchByKey.get(f.key))
              .filter((m): m is BracketMatchState => Boolean(m));
            return (
              <BracketTreeGroup
                key={group.match.key}
                match={match}
                feederMatches={feeders}
                slotMap={slotMap}
                editable={editable}
                nations={nations}
                onAssignSlot={onAssignSlot}
                onSetWinner={onSetWinner}
              />
            );
          })}
        </RoundColumn>
      ))}
    </div>
  );
}

function BracketTreeGroup({
  match,
  feederMatches,
  slotMap,
  editable,
  nations,
  compact,
  onAssignSlot,
  onSetWinner,
}: {
  match: BracketMatchState;
  feederMatches: BracketMatchState[];
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  compact?: boolean;
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
}) {
  const hasFeeders = feederMatches.length === 2;

  return (
    <div
      className={cn(
        "bracket-tree-group flex items-center gap-0",
        hasFeeders ? "min-h-[88px]" : ""
      )}
    >
      {hasFeeders && (
        <>
          <div className="flex flex-col justify-center gap-2 py-1">
            {feederMatches.map((f) => (
              <MatchPair
                key={f.matchKey}
                match={f}
                slotMap={slotMap}
                editable={editable}
                nations={nations}
                compact
                showConnectors={false}
                onAssignSlot={onAssignSlot}
                onSetWinner={onSetWinner}
              />
            ))}
          </div>
          <BracketConnector />
        </>
      )}
      <MatchPair
        match={match}
        slotMap={slotMap}
        editable={editable}
        nations={nations}
        compact={compact}
        showConnectors={hasFeeders}
        onAssignSlot={onAssignSlot}
        onSetWinner={onSetWinner}
      />
    </div>
  );
}

function BracketConnector() {
  return (
    <div className="relative flex w-6 shrink-0 items-stretch self-stretch" aria-hidden>
      <svg
        className="h-full w-full text-[#E53935]"
        viewBox="0 0 24 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 25 H12 V50 H0 M0 75 H12 V50 H0 M12 50 H24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
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
      <div className="flex flex-1 flex-col justify-around gap-4">{children}</div>
    </div>
  );
}

function MatchPair({
  match,
  slotMap,
  editable,
  nations,
  compact,
  showConnectors = false,
  onAssignSlot,
  onSetWinner,
}: {
  match: BracketMatchState;
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  compact?: boolean;
  showConnectors?: boolean;
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
}) {
  const isR32 = match.round === "ROUND_OF_32";
  const [pickerOpen, setPickerOpen] = useState(false);
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const canPickWinner = Boolean(
    editable && match.homeTeamId && match.awayTeamId && !match.homeWaiting && !match.awayWaiting
  );

  return (
    <div
      className={cn(
        "knockout-match-pair flex flex-col gap-1",
        compact && "gap-0.5",
        canPickWinner && "cursor-pointer",
        showConnectors && "relative"
      )}
      onClick={() => canPickWinner && setWinnerOpen(true)}
      onKeyDown={(e) => {
        if (canPickWinner && (e.key === "Enter" || e.key === " ")) setWinnerOpen(true);
      }}
      role={canPickWinner ? "button" : undefined}
      tabIndex={canPickWinner ? 0 : undefined}
    >
      <MatchTeamSlot
        nation={isR32 ? slotMap.get(match.homeSlot)?.nation ?? null : match.homeNation}
        waiting={!isR32 && match.homeWaiting}
        empty={!isR32 && !match.homeNation && !match.homeWaiting}
        editable={editable && isR32}
        isWinner={match.winnerId === match.homeTeamId}
        isLoser={Boolean(
          match.winnerId && match.homeTeamId && match.winnerId !== match.homeTeamId
        )}
        compact={compact}
        onSelect={() => {
          setActiveSlot(match.homeSlot);
          setPickerOpen(true);
        }}
      />
      <div
        className="mx-auto h-3 w-px bg-[#E53935]/70"
        title={canPickWinner ? "Tap to pick winner" : undefined}
      />
      <MatchTeamSlot
        nation={isR32 ? slotMap.get(match.awaySlot)?.nation ?? null : match.awayNation}
        waiting={!isR32 && match.awayWaiting}
        empty={!isR32 && !match.awayNation && !match.awayWaiting}
        editable={editable && isR32}
        isWinner={match.winnerId === match.awayTeamId}
        isLoser={Boolean(
          match.winnerId && match.awayTeamId && match.winnerId !== match.awayTeamId
        )}
        compact={compact}
        onSelect={() => {
          setActiveSlot(match.awaySlot);
          setPickerOpen(true);
        }}
      />

      {editable && isR32 && (
        <NationPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          nations={nations}
          currentId={activeSlot ? slotMap.get(activeSlot)?.nationalTeamId : null}
          onPick={async (id) => {
            if (activeSlot && onAssignSlot) {
              setPickerOpen(false);
              await onAssignSlot(activeSlot, id);
            }
          }}
          onClear={async () => {
            if (activeSlot && onAssignSlot) {
              setPickerOpen(false);
              await onAssignSlot(activeSlot, null);
            }
          }}
        />
      )}

      {editable && (
        <WinnerPickerModal
          open={winnerOpen}
          onClose={() => setWinnerOpen(false)}
          match={match}
          onPick={async (winnerId) => {
            setWinnerOpen(false);
            if (onSetWinner) await onSetWinner(match.matchKey, winnerId);
          }}
        />
      )}
    </div>
  );
}

function MatchTeamSlot({
  nation,
  waiting,
  empty,
  editable,
  isWinner,
  isLoser,
  compact,
  onSelect,
}: {
  nation: BracketNation | null;
  waiting: boolean;
  empty: boolean;
  editable: boolean;
  isWinner: boolean;
  isLoser: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const dimmed = waiting || empty;

  return (
    <button
      type="button"
      disabled={!editable}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onSelect();
      }}
      className={cn(
        "knockout-team-slot flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg border-2 border-[#E53935] bg-[#0a1628]/90 px-2 py-1.5 text-center transition-all",
        compact ? "min-w-[88px] py-1 text-xs" : "min-w-[108px] py-2 text-sm",
        editable && "cursor-pointer hover:border-[#ff6b6b] hover:bg-[#122a4d]",
        !editable && "cursor-default",
        isWinner && "shadow-[0_0_12px_rgba(255,255,255,0.35)] ring-1 ring-white/40",
        isLoser && "opacity-40 grayscale",
        dimmed && !isWinner && !isLoser && "opacity-45"
      )}
    >
      {nation ? (
        <>
          <span className="text-lg leading-none">
            {nation.flagEmoji ?? getNationFlag(nation.name)}
          </span>
          {!compact && (
            <span
              className={cn(
                "truncate font-semibold",
                isWinner ? "text-white" : "text-white/90"
              )}
            >
              {nation.code}
            </span>
          )}
        </>
      ) : waiting ? (
        <span className="text-[10px] font-medium leading-tight text-white/40">
          Waiting for winner
        </span>
      ) : (
        <span className="text-xs font-medium text-white/45">{editable ? "+ Select Team" : "—"}</span>
      )}
    </button>
  );
}

function ChampionDisplay({ nation }: { nation: BracketNation | null }) {
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
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  match: BracketMatchState;
  onPick: (winnerId: string) => void | Promise<void>;
}) {
  const home = match.homeNation;
  const away = match.awayNation;
  if (!home || !away) return null;

  return (
    <MobileFullScreenModal
      open={open}
      onClose={onClose}
      title={getRoundLabel(match.round as KnockoutRound)}
      subtitle="Select winner"
    >
      <div className="flex flex-col gap-3">
        {[
          { nation: home, id: match.homeTeamId! },
          { nation: away, id: match.awayTeamId! },
        ].map(({ nation, id }) => (
          <button
            key={id}
            type="button"
            onClick={() => void onPick(id)}
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 active:scale-[0.98]"
          >
            <span className="text-3xl">{nation.flagEmoji ?? getNationFlag(nation.name)}</span>
            <span className="font-bold text-white">{nation.name}</span>
          </button>
        ))}
      </div>
    </MobileFullScreenModal>
  );
}
