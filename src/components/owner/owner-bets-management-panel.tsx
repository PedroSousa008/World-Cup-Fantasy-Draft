"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createPromotedMatchBetAction,
  publishPromotedMatchBetOddsAction,
  removePromotedMatchBetAction,
  updatePromotedMatchBetOddsAction,
} from "@/lib/actions/bets";
import {
  BET_ODDS_INPUT_CLASS,
  BET_SELECT_CLASS,
} from "@/lib/bets/match-bet-utils";
import type { OwnerMatchOption, PromotedMatchBetDto } from "@/lib/bets/types";
import { Button } from "@/components/ui/button";
import { usePollJson } from "@/hooks/use-poll-json";
import type { MatchBetsPayload } from "@/lib/bets/types";
import { cn } from "@/lib/utils";

interface OwnerBetsManagementPanelProps {
  matchOptions: OwnerMatchOption[];
  activeBets: PromotedMatchBetDto[];
}

function OddsFields({
  bet,
  pending,
  onPublish,
  onSavePublished,
}: {
  bet: PromotedMatchBetDto;
  pending: boolean;
  onPublish: (home: string, draw: string, away: string) => void;
  onSavePublished: (home: string, draw: string, away: string) => void;
}) {
  const [homeOdd, setHomeOdd] = useState(bet.homeOdd ?? "");
  const [drawOdd, setDrawOdd] = useState(bet.drawOdd ?? "");
  const [awayOdd, setAwayOdd] = useState(bet.awayOdd ?? "");

  const isPublished = bet.status === "ODDS_PUBLISHED";

  return (
    <div className="mt-3 space-y-2 border-t border-[#081120]/8 pt-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#081120]/45">
        {isPublished ? "Published odds" : "Optional odds (publish when ready)"}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs font-semibold text-[#081120]/60">
          {bet.homeTeamName}
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1.70"
            value={homeOdd}
            disabled={pending}
            onChange={(e) => setHomeOdd(e.target.value)}
            className={BET_ODDS_INPUT_CLASS}
          />
        </label>
        <label className="text-xs font-semibold text-[#081120]/60">
          Draw
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 3.40"
            value={drawOdd}
            disabled={pending}
            onChange={(e) => setDrawOdd(e.target.value)}
            className={BET_ODDS_INPUT_CLASS}
          />
        </label>
        <label className="text-xs font-semibold text-[#081120]/60">
          {bet.awayTeamName}
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 5.00"
            value={awayOdd}
            disabled={pending}
            onChange={(e) => setAwayOdd(e.target.value)}
            className={BET_ODDS_INPUT_CLASS}
          />
        </label>
      </div>
      {isPublished ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !homeOdd.trim() || !drawOdd.trim() || !awayOdd.trim()}
          onClick={() => onSavePublished(homeOdd, drawOdd, awayOdd)}
          className="w-full border-[#081120]/15 text-[#081120]"
        >
          Save odds
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={pending || !homeOdd.trim() || !drawOdd.trim() || !awayOdd.trim()}
          onClick={() => onPublish(homeOdd, drawOdd, awayOdd)}
          className="w-full bg-[#0066FF] text-white"
        >
          Publish odds
        </Button>
      )}
    </div>
  );
}

export function OwnerBetsManagementPanel({
  matchOptions,
  activeBets: initialBets,
}: OwnerBetsManagementPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const { data, refresh } = usePollJson<MatchBetsPayload>("/api/bets/match-bets", 10_000);

  const activeBets = data?.bets ?? initialBets;

  const [selectedMatchId, setSelectedMatchId] = useState("");

  const availableMatches = useMemo(
    () => matchOptions.filter((m) => !m.alreadyPromoted),
    [matchOptions]
  );

  const createBet = () => {
    if (!selectedMatchId) return;
    setMessage(null);
    startTransition(() => {
      void createPromotedMatchBetAction({ matchId: selectedMatchId }).then((result) => {
        if (result.ok) {
          setSelectedMatchId("");
          setMessage(null);
          void refresh();
        } else {
          setMessage(result.error ?? "Could not add match.");
        }
      });
    });
  };

  const removeBet = (betId: string) => {
    startTransition(() => {
      void removePromotedMatchBetAction(betId).then((result) => {
        if (result.ok) void refresh();
      });
    });
  };

  const publishOdds = (betId: string, home: string, draw: string, away: string) => {
    startTransition(() => {
      void publishPromotedMatchBetOddsAction({
        betId,
        homeOdd: home,
        drawOdd: draw,
        awayOdd: away,
      }).then((result) => {
        if (result.ok) void refresh();
      });
    });
  };

  const savePublishedOdds = (betId: string, home: string, draw: string, away: string) => {
    startTransition(() => {
      void updatePromotedMatchBetOddsAction({
        betId,
        homeOdd: home,
        drawOdd: draw,
        awayOdd: away,
      }).then((result) => {
        if (result.ok) void refresh();
      });
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5">
        <h2 className="text-sm font-bold text-[#081120]">Create bet from matchday match</h2>
        <p className="mt-1 text-xs text-[#081120]/50">
          Select a match and add it to Bets. Users can vote immediately. Add odds later when
          you are ready.
        </p>

        <div className="mt-4 space-y-3">
          <select
            value={selectedMatchId}
            disabled={pending || availableMatches.length === 0}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className={BET_SELECT_CLASS}
          >
            <option value="">Select match…</option>
            {availableMatches.map((m) => (
              <option key={m.id} value={m.id}>
                MD{m.matchday} · {m.homeTeamName} vs {m.awayTeamName}
              </option>
            ))}
          </select>

          {message && (
            <p className="text-sm font-semibold text-[#E53935]">{message}</p>
          )}

          <Button
            type="button"
            disabled={pending || !selectedMatchId}
            onClick={createBet}
            className="w-full"
          >
            Add to Bets
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/45">
          Active betting matches ({activeBets.length})
        </h2>

        {activeBets.length === 0 ? (
          <p className="rounded-2xl bg-white/95 p-6 text-center text-sm text-[#081120]/50">
            No promoted matches yet.
          </p>
        ) : (
          activeBets.map((bet) => (
            <article
              key={bet.id}
              className="rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-[#081120]/45">
                      {bet.matchday != null ? `MD${bet.matchday}` : "Match"}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        bet.status === "VOTING_OPEN"
                          ? "bg-[#00C853]/15 text-[#00C853]"
                          : "bg-[#0066FF]/15 text-[#0066FF]"
                      )}
                    >
                      {bet.status === "VOTING_OPEN" ? "Voting open" : "Odds published"}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#081120]">
                    {bet.homeTeamName} vs {bet.awayTeamName}
                  </h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => removeBet(bet.id)}
                  className="shrink-0 border-[#E53935]/30 text-[#E53935]"
                >
                  Remove
                </Button>
              </div>

              <div className="mt-3 space-y-1 text-sm text-[#081120]/80">
                <div className="flex justify-between">
                  <span>{bet.homeTeamName}</span>
                  <span className="font-bold">{bet.stats.homeVotes} votes</span>
                </div>
                <div className="flex justify-between">
                  <span>Draw</span>
                  <span className="font-bold">{bet.stats.drawVotes} votes</span>
                </div>
                <div className="flex justify-between">
                  <span>{bet.awayTeamName}</span>
                  <span className="font-bold">{bet.stats.awayVotes} votes</span>
                </div>
                <div className="flex justify-between border-t border-[#081120]/8 pt-2 font-bold text-[#081120]">
                  <span>Total</span>
                  <span>{bet.stats.totalVotes} votes</span>
                </div>
              </div>

              <OddsFields
                key={`${bet.id}-${bet.status}-${bet.homeOdd ?? ""}-${bet.drawOdd ?? ""}-${bet.awayOdd ?? ""}`}
                bet={bet}
                pending={pending}
                onPublish={(h, d, a) => publishOdds(bet.id, h, d, a)}
                onSavePublished={(h, d, a) => savePublishedOdds(bet.id, h, d, a)}
              />
            </article>
          ))
        )}
      </section>
    </div>
  );
}
