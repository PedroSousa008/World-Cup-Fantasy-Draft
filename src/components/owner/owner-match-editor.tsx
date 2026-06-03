"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Plus, Search, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";
import {
  saveMatchResultAction,
  saveMatchParticipationAction,
  resetMatchAction,
  toggleMatchBettingAction,
} from "@/lib/actions/owner/matches";
import { getParticipationTeams, type ParticipationTeam } from "@/lib/scoring/match-participation";
import { getNationFlag } from "@/lib/nations";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";

const EVENT_SECTIONS = [
  { type: SCORING_EVENT_TYPES.GOAL, label: "Goalscorers" },
  { type: SCORING_EVENT_TYPES.ASSIST, label: "Assists" },
  { type: SCORING_EVENT_TYPES.YELLOW_CARD, label: "Yellow Cards" },
  { type: SCORING_EVENT_TYPES.RED_CARD, label: "Red Cards" },
  { type: SCORING_EVENT_TYPES.OWN_GOAL, label: "Own Goals" },
  { type: SCORING_EVENT_TYPES.PENALTY_MISS, label: "Missed Penalties" },
  { type: SCORING_EVENT_TYPES.PENALTY_SAVE, label: "Saved Penalties" },
] as const;

interface MatchEventRow {
  playerId: string;
  eventType: string;
}

interface PlayerOption {
  id: string;
  name: string;
  position: string;
  teamId: string;
  teamName: string;
}

interface OwnerMatchEditorProps {
  match: {
    id: string;
    matchday: number | null;
    groupName: string | null;
    scheduledAt: string;
    status: string;
    homeScore: number;
    awayScore: number;
    bettingOpen: boolean;
    manOfTheMatchId: string | null;
    homeTeam: { id: string; name: string; flagEmoji: string | null };
    awayTeam: { id: string; name: string; flagEmoji: string | null };
  };
  events: { playerId: string; eventType: string }[];
  participantIds: string[];
  players: PlayerOption[];
}

function formatCompactKickoff(iso: string): string {
  const d = new Date(iso);
  const date = d
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .replace(".", "")
    .toUpperCase();
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} • ${time}`;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "LIVE":
      return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300";
    case "FINISHED":
      return "border-white/20 bg-white/10 text-white/80";
    default:
      return "border-[#4a90d9]/40 bg-[#0066FF]/10 text-[#7eb8ff]";
  }
}

export function OwnerMatchEditor({
  match,
  events: initialEvents,
  participantIds: initialParticipantIds,
  players,
}: OwnerMatchEditorProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [motmOpen, setMotmOpen] = useState(false);
  const [participationOpen, setParticipationOpen] = useState(false);
  const [participationTeams, setParticipationTeams] = useState<ParticipationTeam[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(
    () => new Set(initialParticipantIds)
  );
  const [participationSaved, setParticipationSaved] = useState(initialParticipantIds.length > 0);

  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [status, setStatus] = useState(match.status);
  const [bettingOpen, setBettingOpen] = useState(match.bettingOpen);
  const [motmId, setMotmId] = useState(match.manOfTheMatchId ?? "");
  const [events, setEvents] = useState<MatchEventRow[]>(
    initialEvents.map((e) => ({ playerId: e.playerId, eventType: e.eventType }))
  );

  const motmPlayer = useMemo(
    () => players.find((p) => p.id === motmId),
    [players, motmId]
  );

  const participationNeeded = useMemo(
    () =>
      getParticipationTeams(
        status,
        homeScore,
        awayScore,
        match.homeTeam,
        match.awayTeam
      ),
    [status, homeScore, awayScore, match.homeTeam, match.awayTeam]
  );

  const openParticipationPicker = () => {
    if (participationNeeded) {
      setParticipationTeams(participationNeeded);
      setParticipationOpen(true);
    }
  };

  const matchMeta = useMemo(() => {
    const parts: string[] = [];
    if (match.matchday != null) parts.push(`MATCHDAY ${match.matchday}`);
    if (match.groupName) parts.push(`GROUP ${match.groupName.toUpperCase()}`);
    return parts.join(" • ");
  }, [match.matchday, match.groupName]);

  const showSuccess = () => {
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 2800);
  };

  const save = () => {
    setError(null);
    if (status !== "FINISHED") {
      setError("Set status to Finished for group tables and player points to update.");
      return;
    }
    startTransition(async () => {
      const result = await saveMatchResultAction({
        matchId: match.id,
        homeScore,
        awayScore,
        status: status as "SCHEDULED" | "LIVE" | "FINISHED",
        manOfTheMatchId: motmId || null,
        bettingOpen,
        events: events.filter((e) => e.playerId),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showSuccess();
      if (result.data?.participationRequired?.length) {
        setParticipationTeams(result.data.participationRequired);
        setSelectedParticipantIds(new Set());
        setParticipationSaved(false);
        setParticipationOpen(true);
      } else {
        setParticipationSaved(true);
      }
    });
  };

  const confirmParticipation = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveMatchParticipationAction({
        matchId: match.id,
        playerIds: [...selectedParticipantIds],
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setParticipationOpen(false);
      setParticipationSaved(true);
      showSuccess();
    });
  };

  const reset = () => {
    setError(null);
    startTransition(async () => {
      const result = await resetMatchAction(match.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setHomeScore(0);
      setAwayScore(0);
      setStatus("SCHEDULED");
      setMotmId("");
      setEvents([]);
      setSelectedParticipantIds(new Set());
      setParticipationSaved(false);
      setParticipationOpen(false);
      setResetOpen(false);
      showSuccess();
    });
  };

  const toggleBetting = () => {
    const next = !bettingOpen;
    startTransition(async () => {
      const result = await toggleMatchBettingAction(match.id, next);
      if (result.ok) setBettingOpen(next);
    });
  };

  const addEvent = (eventType: string) => {
    setEvents((prev) => [...prev, { playerId: "", eventType }]);
  };

  const updateEventPlayer = (index: number, playerId: string) => {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, playerId } : e)));
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Match header */}
      <div className="wc-card-dark overflow-hidden p-4">
        {matchMeta && (
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/45">
            {matchMeta}
          </p>
        )}
        <p className="mt-1 text-center text-xs font-medium text-white/55">
          {formatCompactKickoff(match.scheduledAt)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <TeamLabel team={match.homeTeam} align="left" />
          <span className="shrink-0 text-xs font-bold text-white/35">VS</span>
          <TeamLabel team={match.awayTeam} align="right" />
        </div>

        <div className="mt-3 flex justify-center">
          <span
            className={cn(
              "rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              statusBadgeClass(status)
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Score + status */}
      <div className="wc-card-dark space-y-4 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/45">Result</p>
        <div className="flex items-end gap-3">
          <ScoreInput
            label={match.homeTeam.name}
            value={homeScore}
            onChange={setHomeScore}
          />
          <span className="pb-3 text-sm font-bold text-white/30">–</span>
          <ScoreInput
            label={match.awayTeam.name}
            value={awayScore}
            onChange={setAwayScore}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/45">Status</p>
          <SegmentedControl
            value={status}
            onChange={setStatus}
            options={[
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "LIVE", label: "Live" },
              { value: "FINISHED", label: "Finished" },
            ]}
          />
        </div>
      </div>

      {/* MOTM */}
      <div className="wc-card-dark space-y-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/45">
          Man of the Match
        </p>
        <button
          type="button"
          onClick={() => setMotmOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-left ring-1 ring-white/10 active:bg-white/[0.08]"
        >
          {motmPlayer ? (
            <span className="text-sm font-semibold text-white">
              {motmPlayer.name}{" "}
              <span className="text-white/45">({motmPlayer.position})</span>
            </span>
          ) : (
            <span className="text-sm text-white/40">Select player…</span>
          )}
          <Search className="h-4 w-4 shrink-0 text-white/35" />
        </button>
        {motmId && (
          <button
            type="button"
            onClick={() => setMotmId("")}
            className="text-xs font-semibold text-white/45 hover:text-white/70"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Betting toggle */}
      <button
        type="button"
        onClick={toggleBetting}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ring-1 transition-colors",
          bettingOpen
            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
            : "bg-white/5 text-white/60 ring-white/10"
        )}
      >
        <span>Betting</span>
        <span>{bettingOpen ? "Open" : "Closed"}</span>
      </button>

      {/* Events */}
      <div className="space-y-2">
        <p className="px-1 text-xs font-bold uppercase tracking-wider text-white/45">
          Match Events
        </p>
        {EVENT_SECTIONS.map((section) => (
          <EventSection
            key={section.type}
            label={section.label}
            eventType={section.type}
            events={events}
            players={players}
            onAdd={() => addEvent(section.type)}
            onRemove={removeEvent}
            onChangePlayer={updateEventPlayer}
          />
        ))}
      </div>

      {/* Participation status */}
      {participationNeeded && !participationSaved && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5">
          <p className="text-xs text-amber-200">
            Select which players participated to apply win (+2) and clean sheet (+4 GK/DEF)
            bonuses.
          </p>
          <button
            type="button"
            onClick={openParticipationPicker}
            className="mt-2 text-xs font-bold text-amber-100 underline"
          >
            Select played players
          </button>
        </div>
      )}
      {participationSaved && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          Player participation confirmed — win & clean sheet bonuses applied.
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={save}
          isLoading={pending}
          className="flex-1"
          size="lg"
        >
          Save match
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setResetOpen(true)}
          disabled={pending}
          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          Reset match
        </Button>
      </div>

      {success && (
        <div
          className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
          role="status"
        >
          <Check className="h-4 w-4" />
          Match updated
        </div>
      )}

      <PlayerSearchModal
        open={motmOpen}
        onClose={() => setMotmOpen(false)}
        title="Man of the Match"
        players={players}
        selectedId={motmId}
        onSelect={(id) => {
          setMotmId(id);
          setMotmOpen(false);
        }}
      />

      <MobileFullScreenModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset match?"
        subtitle="This will remove all entered match data and recalculate fantasy points."
      >
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="danger"
            size="lg"
            isLoading={pending}
            onClick={reset}
            className="w-full"
          >
            Reset match
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => setResetOpen(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </MobileFullScreenModal>

      <ParticipationModal
        open={participationOpen}
        onClose={() => setParticipationOpen(false)}
        teams={participationTeams}
        players={players}
        selectedIds={selectedParticipantIds}
        onToggle={(id) => {
          setSelectedParticipantIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
        onConfirm={confirmParticipation}
        pending={pending}
      />
    </div>
  );
}

function TeamLabel({
  team,
  align,
}: {
  team: { name: string; flagEmoji: string | null };
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-1.5",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <span className="text-xl leading-none">
        {team.flagEmoji ?? getNationFlag(team.name)}
      </span>
      <span className="truncate text-sm font-bold text-white">{team.name}</span>
    </div>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 space-y-1">
      <p className="truncate text-center text-[10px] font-medium text-white/40">{label}</p>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 text-center text-2xl font-black tabular-nums text-white focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25"
      />
    </div>
  );
}

function EventSection({
  label,
  eventType,
  events,
  players,
  onAdd,
  onRemove,
  onChangePlayer,
}: {
  label: string;
  eventType: string;
  events: MatchEventRow[];
  players: PlayerOption[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangePlayer: (index: number, playerId: string) => void;
}) {
  const indices = events
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.eventType === eventType)
    .map(({ i }) => i);

  const [open, setOpen] = useState(indices.length > 0);

  return (
    <div className="wc-card-dark overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-white">
          {label}
          {indices.length > 0 && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
              {indices.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-white/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t border-white/8 px-3 pb-3 pt-2">
          {indices.length === 0 && (
            <p className="py-1 text-xs text-white/35">No entries yet.</p>
          )}
          {indices.map((globalIndex) => (
            <div key={globalIndex} className="flex items-center gap-2">
              <select
                value={events[globalIndex].playerId}
                onChange={(e) => onChangePlayer(globalIndex, e.target.value)}
                className="h-10 min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white focus:border-[#0066FF] focus:outline-none"
              >
                <option value="" className="bg-[#0d1a2e]">
                  Select player…
                </option>
                {players.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0d1a2e]">
                    {p.name} ({p.position})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onRemove(globalIndex)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 active:bg-red-500/20"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-xs font-semibold text-white/60 active:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Add {label.toLowerCase().replace(/s$/, "")}
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerSearchModal({
  open,
  onClose,
  title,
  players,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  players: PlayerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.teamName.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query)
    );
  }, [players, q]);

  return (
    <MobileFullScreenModal open={open} onClose={onClose} title={title}>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          placeholder="Search players…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-[#0066FF]/40"
        />
      </div>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left active:bg-white/10",
              selectedId === p.id ? "bg-[#0066FF]/20 ring-1 ring-[#0066FF]/50" : "bg-white/5"
            )}
          >
            <span className="font-semibold text-white">{p.name}</span>
            <span className="text-xs text-white/45">
              {p.position} · {p.teamName}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-white/40">No players found.</p>
        )}
      </div>
    </MobileFullScreenModal>
  );
}

function ParticipationModal({
  open,
  onClose,
  teams,
  players,
  selectedIds,
  onToggle,
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  teams: ParticipationTeam[];
  players: PlayerOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (teams.length === 0) return null;

  return (
    <MobileFullScreenModal
      open={open}
      onClose={onClose}
      title="Select players who played"
      subtitle="Win bonus (+2) applies to selected players. Clean sheet (+4) applies to selected GK/DEF only."
    >
      <div className="space-y-5">
        {teams.map((team) => {
          const teamPlayers = players.filter((p) => p.teamId === team.teamId);
          const hasWin = team.reasons.includes("win");
          const hasCs = team.reasons.includes("clean_sheet");
          return (
            <div key={team.teamId} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{team.flagEmoji ?? "🏳️"}</span>
                <span className="font-bold text-white">{team.teamName}</span>
              </div>
              <p className="text-xs text-white/45">
                {hasWin && hasCs && "Win + clean sheet bonuses"}
                {hasWin && !hasCs && "Win bonus only"}
                {!hasWin && hasCs && "Clean sheet bonus (GK/DEF only)"}
              </p>
              <div className="max-h-[40vh] space-y-1 overflow-y-auto rounded-xl bg-white/5 p-2">
                {teamPlayers.map((p) => {
                  const checked = selectedIds.has(p.id);
                  const csEligible = p.position === "GK" || p.position === "DEF";
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 active:bg-white/10",
                        checked && "bg-[#0066FF]/15"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(p.id)}
                        className="h-4 w-4 rounded border-white/30"
                      />
                      <span className="flex-1 font-medium text-white">{p.name}</span>
                      <span className="text-xs text-white/45">
                        {p.position}
                        {hasCs && csEligible && " · CS"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          size="lg"
          className="w-full"
          isLoading={pending}
          onClick={onConfirm}
        >
          Confirm participation
        </Button>
        <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </MobileFullScreenModal>
  );
}
