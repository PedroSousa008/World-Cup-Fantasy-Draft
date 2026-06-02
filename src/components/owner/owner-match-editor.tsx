"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";
import {
  saveMatchResultAction,
  toggleMatchBettingAction,
} from "@/lib/actions/owner/matches";
import { formatKickoff } from "@/lib/tournament/format";
import { getNationFlag } from "@/lib/nations";

const EVENT_OPTIONS = [
  { value: SCORING_EVENT_TYPES.GOAL, label: "Goal" },
  { value: SCORING_EVENT_TYPES.ASSIST, label: "Assist" },
  { value: SCORING_EVENT_TYPES.YELLOW_CARD, label: "Yellow card" },
  { value: SCORING_EVENT_TYPES.RED_CARD, label: "Red card" },
  { value: SCORING_EVENT_TYPES.OWN_GOAL, label: "Own goal" },
  { value: SCORING_EVENT_TYPES.PENALTY_MISS, label: "Missed penalty" },
];

interface MatchEventRow {
  playerId: string;
  eventType: string;
  minute: number | null;
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
  events: MatchEventRow[];
  players: { id: string; name: string; position: string; teamId: string; teamName: string }[];
}

export function OwnerMatchEditor({ match, events: initialEvents, players }: OwnerMatchEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [status, setStatus] = useState(match.status);
  const [bettingOpen, setBettingOpen] = useState(match.bettingOpen);
  const [motmId, setMotmId] = useState(match.manOfTheMatchId ?? "");
  const [events, setEvents] = useState<MatchEventRow[]>(
    initialEvents.map((e) => ({
      playerId: e.playerId,
      eventType: e.eventType,
      minute: e.minute,
    }))
  );

  const addEvent = () => {
    setEvents((prev) => [
      ...prev,
      { playerId: players[0]?.id ?? "", eventType: SCORING_EVENT_TYPES.GOAL, minute: null },
    ]);
  };

  const save = () => {
    setError(null);
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
      router.refresh();
    });
  };

  const toggleBetting = () => {
    const next = !bettingOpen;
    startTransition(async () => {
      const result = await toggleMatchBettingAction(match.id, next);
      if (result.ok) {
        setBettingOpen(next);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="wc-card space-y-2">
        <p className="text-sm text-[#081120]/60">
          MD{match.matchday} · Group {match.groupName} · {formatKickoff(match.scheduledAt)}
        </p>
        <div className="flex items-center justify-center gap-4 text-lg font-bold">
          <span>
            {match.homeTeam.flagEmoji ?? getNationFlag(match.homeTeam.name)} {match.homeTeam.name}
          </span>
          <span className="text-[#081120]/40">vs</span>
          <span>
            {match.awayTeam.name} {match.awayTeam.flagEmoji ?? getNationFlag(match.awayTeam.name)}
          </span>
        </div>
        <p className="text-center text-xs text-[#081120]/50">
          Clean sheets are calculated automatically for GK/DEF when a team concedes 0 goals.
        </p>
      </div>

      <div className="wc-card grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[#081120]">
          Home goals
          <Input
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="mt-1"
          />
        </label>
        <label className="block text-sm font-semibold text-[#081120]">
          Away goals
          <Input
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="mt-1"
          />
        </label>
        <label className="block text-sm font-semibold text-[#081120]">
          Status
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1"
            options={[
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "LIVE", label: "Live" },
              { value: "FINISHED", label: "Finished" },
            ]}
          />
        </label>
        <label className="block text-sm font-semibold text-[#081120]">
          Man of the Match
          <Select
            value={motmId}
            onChange={(e) => setMotmId(e.target.value)}
            className="mt-1"
            options={[
              { value: "", label: "— None —" },
              ...players.map((p) => ({ value: p.id, label: `${p.name} (${p.teamName})` })),
            ]}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant={bettingOpen ? "success" : "outline"} onClick={toggleBetting}>
          Betting {bettingOpen ? "open" : "closed"}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Match events</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addEvent}>
            Add event
          </Button>
        </div>
        {events.map((ev, idx) => (
          <div key={idx} className="wc-card grid gap-2 sm:grid-cols-4">
            <Select
              value={ev.playerId}
              onChange={(e) => {
                const next = [...events];
                next[idx] = { ...ev, playerId: e.target.value };
                setEvents(next);
              }}
              options={players.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.position})`,
              }))}
            />
            <Select
              value={ev.eventType}
              onChange={(e) => {
                const next = [...events];
                next[idx] = { ...ev, eventType: e.target.value };
                setEvents(next);
              }}
              options={EVENT_OPTIONS}
            />
            <Input
              type="number"
              placeholder="Min"
              min={0}
              max={130}
              value={ev.minute ?? ""}
              onChange={(e) => {
                const next = [...events];
                next[idx] = {
                  ...ev,
                  minute: e.target.value === "" ? null : Number(e.target.value),
                };
                setEvents(next);
              }}
            />
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setEvents(events.filter((_, i) => i !== idx))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm font-semibold text-[#E53935]">{error}</p>}

      <Button type="button" onClick={save} isLoading={pending} className="w-full sm:w-auto">
        Save match
      </Button>
    </div>
  );
}
