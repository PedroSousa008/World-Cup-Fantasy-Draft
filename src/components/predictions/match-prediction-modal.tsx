"use client";

import { useEffect, useState, useTransition } from "react";
import { Lock, Minus, Plus } from "lucide-react";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { Button } from "@/components/ui/button";
import { getNationFlag } from "@/lib/nations";
import { formatKickoff } from "@/lib/tournament/format";
import {
  getMatchPredictionFormAction,
  saveMatchPredictionAction,
} from "@/lib/actions/predictions/match-predictions";
import type {
  MatchPredictionFormData,
  MatchPredictionPlayer,
} from "@/lib/predictions/get-match-predictions-data";
import { cn } from "@/lib/utils";

interface MatchPredictionModalProps {
  matchId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function MatchPredictionModal({ matchId, onClose, onSaved }: MatchPredictionModalProps) {
  const [formData, setFormData] = useState<MatchPredictionFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [firstGoalscorerId, setFirstGoalscorerId] = useState<string | null>(null);
  const [mvpPlayerId, setMvpPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setFormData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      const data = await getMatchPredictionFormAction(matchId);
      if (cancelled) return;
      if (!data) {
        setError("Could not load match.");
        setFormData(null);
      } else {
        setFormData(data);
        setHomeGoals(data.existing?.predictedHomeGoals ?? 0);
        setAwayGoals(data.existing?.predictedAwayGoals ?? 0);
        setFirstGoalscorerId(data.existing?.firstGoalscorerId ?? null);
        setMvpPlayerId(data.existing?.mvpPlayerId ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const submit = () => {
    if (!matchId || !formData || formData.locked) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await saveMatchPredictionAction({
          matchId,
          predictedHomeGoals: homeGoals,
          predictedAwayGoals: awayGoals,
          firstGoalscorerId,
          mvpPlayerId,
        });

        if (!result.ok) {
          setError(result.error ?? "Could not save prediction.");
          return;
        }

        onSaved();
        onClose();
      })();
    });
  };

  const match = formData?.match;
  const title = match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : "Match prediction";

  return (
    <MobileFullScreenModal
      open={Boolean(matchId)}
      onClose={onClose}
      title={title}
      subtitle={match ? `Matchday ${match.matchday}` : undefined}
    >
      {loading && (
        <p className="py-8 text-center text-sm text-white/50">Loading match…</p>
      )}

      {!loading && error && !formData && (
        <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">{error}</p>
      )}

      {formData && match && (
        <div className="mx-auto flex max-w-md flex-col gap-5 pb-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-white/40">Kickoff</p>
              <p className="text-sm font-semibold text-white">
                {formatKickoff(match.scheduledAt)}
              </p>
            </div>
            {formData.deadlineLabel && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-white/40">Deadline</p>
                <p className="text-sm font-semibold text-[#0066FF]">{formData.deadlineLabel}</p>
              </div>
            )}
          </div>

          {formData.locked && (
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <Lock className="h-4 w-4 text-white/50" />
              <p className="text-sm text-white/60">
                Predictions locked for this matchday.
                {formData.existing ? " You can view your submission below." : ""}
              </p>
            </div>
          )}

          {formData.existing?.isSettled && (
            <div className="rounded-xl bg-[#00C853]/10 px-4 py-3 ring-1 ring-[#00C853]/20">
              <p className="text-sm font-semibold text-[#00C853]">
                {formData.existing.pointsEarned > 0
                  ? `+${formData.existing.pointsEarned} points — exact score!`
                  : "0 points — score was not exact."}
              </p>
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/45">
              Exact score
            </h3>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <ScoreTeamPicker
                name={match.homeTeam.name}
                flag={match.homeTeam.flagEmoji}
                value={homeGoals}
                onChange={setHomeGoals}
                disabled={formData.locked}
              />
              <span className="text-lg font-bold text-white/30">–</span>
              <ScoreTeamPicker
                name={match.awayTeam.name}
                flag={match.awayTeam.flagEmoji}
                value={awayGoals}
                onChange={setAwayGoals}
                disabled={formData.locked}
              />
            </div>
          </section>

          <PlayerSelector
            label="First goalscorer"
            optional
            value={firstGoalscorerId}
            onChange={setFirstGoalscorerId}
            homePlayers={formData.homePlayers}
            awayPlayers={formData.awayPlayers}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            disabled={formData.locked}
          />

          <PlayerSelector
            label="MVP of the match"
            optional
            value={mvpPlayerId}
            onChange={setMvpPlayerId}
            homePlayers={formData.homePlayers}
            awayPlayers={formData.awayPlayers}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            disabled={formData.locked}
          />

          {error && (
            <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/5"
            >
              Close
            </Button>
            {!formData.locked && (
              <Button type="button" disabled={pending} onClick={submit} className="flex-1">
                {pending ? "Saving…" : formData.existing ? "Update prediction" : "Submit"}
              </Button>
            )}
          </div>
        </div>
      )}
    </MobileFullScreenModal>
  );
}

function ScoreTeamPicker({
  name,
  flag,
  value,
  onChange,
  disabled,
}: {
  name: string;
  flag: string | null;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/8">
      <span className="text-2xl">{flag ?? getNationFlag(name)}</span>
      <p className="truncate text-center text-xs font-semibold text-white">{name}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-2xl font-black tabular-nums text-[#0066FF]">
          {value}
        </span>
        <button
          type="button"
          disabled={disabled || value >= 20}
          onClick={() => onChange(Math.min(20, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PlayerSelector({
  label,
  optional,
  value,
  onChange,
  homePlayers,
  awayPlayers,
  homeTeamName,
  awayTeamName,
  disabled,
}: {
  label: string;
  optional?: boolean;
  value: string | null;
  onChange: (id: string | null) => void;
  homePlayers: MatchPredictionPlayer[];
  awayPlayers: MatchPredictionPlayer[];
  homeTeamName: string;
  awayTeamName: string;
  disabled?: boolean;
}) {
  const selected =
    [...homePlayers, ...awayPlayers].find((p) => p.id === value) ?? null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/45">{label}</h3>
        {optional && <span className="text-[10px] text-white/30">Optional</span>}
      </div>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-[#0B1526] px-3 py-3 text-sm text-white outline-none focus:border-[#0066FF]/50",
          disabled && "opacity-60"
        )}
      >
        <option value="">No selection</option>
        {homePlayers.length > 0 && (
          <optgroup label={homeTeamName}>
            {homePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </optgroup>
        )}
        {awayPlayers.length > 0 && (
          <optgroup label={awayTeamName}>
            {awayPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      {selected && (
        <p className="text-xs text-white/45">
          Selected: {selected.name} ({selected.nationName})
        </p>
      )}
    </section>
  );
}
