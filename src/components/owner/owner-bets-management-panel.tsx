"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  createPromotedMatchBetAction,
  removePromotedMatchBetAction,
  updatePromotedMatchBetOddsAction,
} from "@/lib/actions/bets";
import type { OwnerMatchOption, PromotedMatchBetDto } from "@/lib/bets/types";
import { Button } from "@/components/ui/button";
import { usePollJson } from "@/hooks/use-poll-json";
import type { MatchBetsPayload } from "@/lib/bets/types";

interface OwnerBetsManagementPanelProps {
  matchOptions: OwnerMatchOption[];
  activeBets: PromotedMatchBetDto[];
}

export function OwnerBetsManagementPanel({
  matchOptions,
  activeBets: initialBets,
}: OwnerBetsManagementPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { data, refresh } = usePollJson<MatchBetsPayload>("/api/bets/match-bets", 12_000);

  const activeBets = data?.bets ?? initialBets;

  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [homeOdd, setHomeOdd] = useState("");
  const [awayOdd, setAwayOdd] = useState("");

  const availableMatches = useMemo(
    () => matchOptions.filter((m) => !m.alreadyPromoted),
    [matchOptions]
  );

  const createBet = () => {
    if (!selectedMatchId) return;
    startTransition(() => {
      void createPromotedMatchBetAction({
        matchId: selectedMatchId,
        homeOdd,
        awayOdd,
      }).then((result) => {
        if (result.ok) {
          setSelectedMatchId("");
          setHomeOdd("");
          setAwayOdd("");
          void refresh();
          router.refresh();
        }
      });
    });
  };

  const removeBet = (betId: string) => {
    startTransition(() => {
      void removePromotedMatchBetAction(betId).then((result) => {
        if (result.ok) {
          void refresh();
          router.refresh();
        }
      });
    });
  };

  const saveOdds = (betId: string, nextHome: string, nextAway: string) => {
    startTransition(() => {
      void updatePromotedMatchBetOddsAction({
        betId,
        homeOdd: nextHome,
        awayOdd: nextAway,
      }).then((result) => {
        if (result.ok) {
          void refresh();
          router.refresh();
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5">
        <h2 className="text-sm font-bold text-[#081120]">Create bet from matchday match</h2>
        <p className="mt-1 text-xs text-[#081120]/50">
          Select a real match and enter odds manually. Only promoted matches appear in the Bets tab.
        </p>

        <div className="mt-4 space-y-3">
          <select
            value={selectedMatchId}
            disabled={pending || availableMatches.length === 0}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#081120]/10 px-3 text-sm text-[#081120]"
          >
            <option value="">Select match…</option>
            {availableMatches.map((m) => (
              <option key={m.id} value={m.id}>
                MD{m.matchday} · {m.homeTeamName} vs {m.awayTeamName}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Home odd (e.g. 1.80)"
              value={homeOdd}
              disabled={pending}
              onChange={(e) => setHomeOdd(e.target.value)}
              className="h-11 rounded-xl border border-[#081120]/10 px-3 text-sm"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Away odd (e.g. 2.40)"
              value={awayOdd}
              disabled={pending}
              onChange={(e) => setAwayOdd(e.target.value)}
              className="h-11 rounded-xl border border-[#081120]/10 px-3 text-sm"
            />
          </div>

          <Button
            type="button"
            disabled={pending || !selectedMatchId || !homeOdd.trim() || !awayOdd.trim()}
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
                  <p className="text-xs text-[#081120]/45">
                    {bet.matchday != null ? `MD${bet.matchday}` : "Match"}
                  </p>
                  <h3 className="font-bold text-[#081120]">
                    {bet.homeTeamName} vs {bet.awayTeamName}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => removeBet(bet.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#E53935]"
                  aria-label="Remove bet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-[#081120]/50">
                  {bet.homeTeamName} odd
                  <input
                    type="text"
                    defaultValue={bet.homeOdd}
                    disabled={pending}
                    className="mt-1 h-10 w-full rounded-lg border border-[#081120]/10 px-2 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== bet.homeOdd) {
                        saveOdds(bet.id, e.target.value, bet.awayOdd);
                      }
                    }}
                  />
                </label>
                <label className="text-xs text-[#081120]/50">
                  {bet.awayTeamName} odd
                  <input
                    type="text"
                    defaultValue={bet.awayOdd}
                    disabled={pending}
                    className="mt-1 h-10 w-full rounded-lg border border-[#081120]/10 px-2 text-sm"
                    onBlur={(e) => {
                      if (e.target.value !== bet.awayOdd) {
                        saveOdds(bet.id, bet.homeOdd, e.target.value);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="mt-3 space-y-1 border-t border-[#081120]/8 pt-3 text-sm">
                <div className="flex justify-between text-[#081120]/70">
                  <span>{bet.homeTeamName}</span>
                  <span className="font-bold">{bet.stats.homeVotes} votes</span>
                </div>
                <div className="flex justify-between text-[#081120]/70">
                  <span>{bet.awayTeamName}</span>
                  <span className="font-bold">{bet.stats.awayVotes} votes</span>
                </div>
                <div className="flex justify-between font-bold text-[#081120]">
                  <span>Total</span>
                  <span>{bet.stats.totalVotes} votes</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
