"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import { getBracketSideColumns, getRoundLabel } from "@/lib/tournament/knockout/topology";
import type { KnockoutRound } from "@prisma/client";
import type {
  BracketMatchState,
  BracketNation,
  BracketSlotState,
  KnockoutBracketData,
} from "@/lib/tournament/knockout/bracket-service";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";

interface KnockoutBracketViewProps {
  data: KnockoutBracketData;
  editable?: boolean;
  hintText?: string;
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
  onViewMatch?: (matchId: string) => void;
}

export function KnockoutBracketView({
  data,
  editable = false,
  hintText,
  onAssignSlot,
  onSetWinner,
  onViewMatch,
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
          {hintText ??
            "Tap Round of 32 slots to add teams. Tap a match to pick the winner — or enter results under Matches (MD 4–8). Winners advance automatically."}
        </p>
      )}
      {!editable && onViewMatch && (
        <p className="text-sm text-white/55">Tap a match to view details.</p>
      )}

      <div className="knockout-bracket-scroll overflow-x-auto overflow-y-hidden rounded-2xl border border-[#E53935]/30 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#081120] p-3 shadow-[inset_0_0_80px_rgba(0,40,100,0.35)] sm:p-4">
        <div className="knockout-bracket-inner flex min-w-[900px] items-stretch gap-0 pb-2">
          <BracketSide
            side="left"
            matchByKey={matchByKey}
            slotMap={slotMap}
            finalMatch={finalMatch}
            editable={editable}
            nations={data.nations}
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
            onViewMatch={onViewMatch}
          />

          <BracketCenter
            finalMatch={finalMatch}
            championNation={championNation}
            editable={editable}
            slotMap={slotMap}
            nations={data.nations}
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
            onViewMatch={onViewMatch}
          />

          <BracketSide
            side="right"
            matchByKey={matchByKey}
            slotMap={slotMap}
            finalMatch={finalMatch}
            editable={editable}
            nations={data.nations}
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
            onViewMatch={onViewMatch}
          />
        </div>
      </div>
    </div>
  );
}

function BracketSide({
  side,
  matchByKey,
  slotMap,
  finalMatch,
  editable,
  nations,
  onAssignSlot,
  onSetWinner,
  onViewMatch,
}: {
  side: "left" | "right";
  matchByKey: Map<string, BracketMatchState>;
  slotMap: Map<string, BracketSlotState>;
  finalMatch?: BracketMatchState;
  editable: boolean;
  nations: BracketNation[];
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
  onViewMatch?: (matchId: string) => void;
}) {
  const columns = useMemo(() => {
    const cols = getBracketSideColumns(side);
    return side === "right" ? [...cols].reverse() : cols;
  }, [side]);
  const isLeft = side === "left";

  return (
    <div className="flex flex-1 items-stretch">
      {columns.map((col, colIndex) => (
        <div key={col.label} className="flex items-stretch">
          {colIndex > 0 && (
            <BracketRoundConnector
              matchCount={
                columns[colIndex - 1].matchKeys.length ||
                (columns[colIndex - 1].finalistSlotKey ? 1 : 1)
              }
            />
          )}
          <RoundColumn
            label={col.label}
            matchCount={col.matchKeys.length || 1}
            className={cn(isLeft ? "pr-0.5" : "pl-0.5")}
          >
            {col.matchKeys.map((key) => {
              const match = matchByKey.get(key);
              if (!match) return null;
              return (
                <MatchPair
                  key={key}
                  match={match}
                  slotMap={slotMap}
                  editable={editable}
                  nations={nations}
                  onAssignSlot={onAssignSlot}
                  onSetWinner={onSetWinner}
                  onViewMatch={onViewMatch}
                />
              );
            })}
            {col.finalistSlotKey && finalMatch && (
              <FinalistSlot
                nation={isLeft ? finalMatch.homeNation : finalMatch.awayNation}
                waiting={isLeft ? finalMatch.homeWaiting : finalMatch.awayWaiting}
                code={
                  isLeft
                    ? finalMatch.homeNation?.code
                    : finalMatch.awayNation?.code
                }
              />
            )}
          </RoundColumn>
        </div>
      ))}
    </div>
  );
}

function BracketCenter({
  finalMatch,
  championNation,
  editable,
  slotMap,
  nations,
  onAssignSlot,
  onSetWinner,
  onViewMatch,
}: {
  finalMatch?: BracketMatchState;
  championNation: BracketNation | null;
  editable: boolean;
  slotMap: Map<string, BracketSlotState>;
  nations: BracketNation[];
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
  onViewMatch?: (matchId: string) => void;
}) {
  return (
    <div className="flex w-[130px] shrink-0 flex-col items-center justify-center gap-4 border-x border-[#E53935]/25 px-2">
      <RoundColumn label="Final" matchCount={1} className="items-center">
        {finalMatch && (
          <MatchPair
            match={finalMatch}
            slotMap={slotMap}
            editable={editable}
            nations={nations}
            compact
            onAssignSlot={onAssignSlot}
            onSetWinner={onSetWinner}
            onViewMatch={onViewMatch}
          />
        )}
      </RoundColumn>
      <div className="h-px w-full bg-[#E53935]/40" />
      <ChampionDisplay nation={championNation} />
    </div>
  );
}

/** Red lines between round columns */
function BracketRoundConnector({ matchCount }: { matchCount: number }) {
  const h = Math.max(48, matchCount * 52);
  return (
    <div
      className="relative flex w-4 shrink-0 items-center justify-center self-stretch"
      style={{ minHeight: h }}
      aria-hidden
    >
      <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[#E53935]/60" />
      <div className="absolute left-1/2 top-1/4 h-px w-full -translate-y-1/2 bg-[#E53935]" />
      <div className="absolute left-1/2 top-3/4 h-px w-full -translate-y-1/2 bg-[#E53935]" />
    </div>
  );
}

function RoundColumn({
  label,
  children,
  matchCount,
  className,
}: {
  label: string;
  children: React.ReactNode;
  matchCount: number;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-[96px] flex-col", className)}>
      <span className="mb-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#E53935]/90 sm:text-[10px]">
        {label}
      </span>
      <div
        className="flex flex-1 flex-col justify-around gap-2"
        style={{ minHeight: Math.max(120, matchCount * 56) }}
      >
        {children}
      </div>
    </div>
  );
}

function FinalistSlot({
  nation,
  waiting,
  code,
}: {
  nation: BracketNation | null;
  waiting: boolean;
  code?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <MatchTeamSlot
        nation={nation}
        waiting={waiting}
        empty={!nation && !waiting}
        editable={false}
        isWinner={Boolean(nation)}
        isLoser={false}
        compact
        label={code}
        onSelect={() => {}}
      />
      <span className="text-[8px] font-bold uppercase tracking-wider text-[#E53935]/70">
        → Final
      </span>
    </div>
  );
}

function MatchPair({
  match,
  slotMap,
  editable,
  nations,
  compact,
  onAssignSlot,
  onSetWinner,
  onViewMatch,
}: {
  match: BracketMatchState;
  slotMap: Map<string, BracketSlotState>;
  editable: boolean;
  nations: BracketNation[];
  compact?: boolean;
  onAssignSlot?: (slotKey: string, nationalTeamId: string | null) => Promise<void>;
  onSetWinner?: (matchKey: string, winnerNationalTeamId: string) => Promise<void>;
  onViewMatch?: (matchId: string) => void;
}) {
  const isR32 = match.round === "ROUND_OF_32";
  const [pickerOpen, setPickerOpen] = useState(false);
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const canPickWinner = Boolean(
    editable && match.homeTeamId && match.awayTeamId && !match.homeWaiting && !match.awayWaiting
  );

  const canViewMatch = Boolean(
    !editable &&
      onViewMatch &&
      match.matchId &&
      match.homeTeamId &&
      match.awayTeamId &&
      !match.homeWaiting &&
      !match.awayWaiting
  );

  const isInteractive = canPickWinner || canViewMatch;

  return (
    <div
      className={cn(
        "knockout-match-pair flex flex-col gap-0.5",
        isInteractive && "cursor-pointer"
      )}
      onClick={() => {
        if (canPickWinner) setWinnerOpen(true);
        else if (canViewMatch && match.matchId) onViewMatch!(match.matchId);
      }}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          if (canPickWinner) setWinnerOpen(true);
          else if (canViewMatch && match.matchId) onViewMatch!(match.matchId);
        }
      }}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <MatchTeamSlot
        nation={isR32 ? slotMap.get(match.homeSlot)?.nation ?? null : match.homeNation}
        waiting={!isR32 && match.homeWaiting}
        empty={!isR32 && !match.homeNation && !match.homeWaiting}
        editable={editable && isR32 && Boolean(onAssignSlot)}
        isWinner={match.winnerId === match.homeTeamId}
        isLoser={Boolean(
          match.winnerId && match.homeTeamId && match.winnerId !== match.homeTeamId
        )}
        compact={compact}
        label={
          isR32
            ? slotMap.get(match.homeSlot)?.nation?.code
            : match.homeNation?.code
        }
        onSelect={() => {
          setActiveSlot(match.homeSlot);
          setPickerOpen(true);
        }}
      />
      <div className="mx-auto h-2 w-px bg-[#E53935]/80" />
      <MatchTeamSlot
        nation={isR32 ? slotMap.get(match.awaySlot)?.nation ?? null : match.awayNation}
        waiting={!isR32 && match.awayWaiting}
        empty={!isR32 && !match.awayNation && !match.awayWaiting}
        editable={editable && isR32 && Boolean(onAssignSlot)}
        isWinner={match.winnerId === match.awayTeamId}
        isLoser={Boolean(
          match.winnerId && match.awayTeamId && match.winnerId !== match.awayTeamId
        )}
        compact={compact}
        label={
          isR32
            ? slotMap.get(match.awaySlot)?.nation?.code
            : match.awayNation?.code
        }
        onSelect={() => {
          setActiveSlot(match.awaySlot);
          setPickerOpen(true);
        }}
      />

      {editable && isR32 && onAssignSlot && (
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
  label,
  onSelect,
}: {
  nation: BracketNation | null;
  waiting: boolean;
  empty: boolean;
  editable: boolean;
  isWinner: boolean;
  isLoser: boolean;
  compact?: boolean;
  label?: string;
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
        "knockout-team-slot flex w-full items-center justify-center gap-1 rounded-lg border-2 border-[#E53935] bg-[#0a1628]/90 px-1.5 py-1.5 text-center transition-all",
        compact ? "min-h-[36px] text-xs" : "min-h-[40px] text-sm",
        editable && "cursor-pointer hover:border-[#ff6b6b] hover:bg-[#122a4d]",
        !editable && "cursor-default",
        isWinner && "shadow-[0_0_12px_rgba(255,255,255,0.35)] ring-1 ring-white/40",
        isLoser && "opacity-40 grayscale",
        dimmed && !isWinner && !isLoser && "opacity-45"
      )}
    >
      {nation ? (
        <>
          <span className="text-base leading-none sm:text-lg">
            {nation.flagEmoji ?? getNationFlag(nation.name)}
          </span>
          <span
            className={cn(
              "font-bold tracking-tight",
              isWinner ? "text-white" : "text-white/90"
            )}
          >
            {label ?? nation.code}
          </span>
        </>
      ) : waiting ? (
        <span className="text-[9px] font-medium leading-tight text-white/40">Waiting</span>
      ) : (
        <span className="text-[10px] font-medium text-white/45">
          {editable ? "+" : "—"}
        </span>
      )}
    </button>
  );
}

function ChampionDisplay({ nation }: { nation: BracketNation | null }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-xl border-2 border-[#FFD700] bg-gradient-to-b from-[#FFD700]/20 to-[#B8860B]/10 px-3 py-2.5 shadow-[0_0_24px_rgba(255,215,0,0.25)]",
        nation && "ring-2 ring-[#FFD700]/50"
      )}
    >
      <Trophy className="h-7 w-7 text-[#FFD700]/90" />
      {nation ? (
        <>
          <span className="text-2xl leading-none">
            {nation.flagEmoji ?? getNationFlag(nation.name)}
          </span>
          <span className="text-xs font-black text-[#FFD700]">{nation.code}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#FFD700]/70">
            Champion
          </span>
        </>
      ) : (
        <span className="text-[10px] text-white/40">Champion TBD</span>
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
