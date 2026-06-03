"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitMatchBetVoteAction } from "@/lib/actions/bets";
import type { MatchBetsPayload } from "@/lib/bets/types";
import { usePollJson } from "@/hooks/use-poll-json";
import { cn } from "@/lib/utils";

interface MatchBetsViewProps {
  initial: MatchBetsPayload;
  /** Set on server from platform owner check — never from poll/API. */
  showVoteStats: boolean;
}

export function MatchBetsView({ initial, showVoteStats }: MatchBetsViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { data, refresh } = usePollJson<MatchBetsPayload>("/api/bets/match-bets", 15_000);

  const payload = data ?? initial;
  const { bets } = payload;

  const submitPick = (promotedBetId: string, pickedTeamId: string) => {
    startTransition(() => {
      void submitMatchBetVoteAction({ promotedBetId, pickedTeamId }).then((result) => {
        if (result.ok) {
          void refresh();
          router.refresh();
        }
      });
    });
  };

  if (bets.length === 0) {
    return (
      <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
        <p className="font-bold text-[#081120]">No bets available</p>
        <p className="mt-2 text-sm text-[#081120]/55">
          The Owner has not promoted any matches for betting yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => {
        const hasPick = !!bet.userPickTeamId;
        const matchLabel = `${bet.homeTeamName} vs ${bet.awayTeamName}`;

        return (
          <article
            key={bet.id}
            className="overflow-hidden rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5"
          >
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#081120]/40">
                {bet.matchday != null ? `MD${bet.matchday}` : "Match"}
              </p>
              <h3 className="text-lg font-bold text-[#081120]">{matchLabel}</h3>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#081120]/5 px-3 py-2.5 text-center">
                <p className="text-sm font-bold text-[#081120]">
                  {bet.homeTeamFlag && <span className="mr-1">{bet.homeTeamFlag}</span>}
                  {bet.homeTeamName}
                </p>
                <p className="mt-1 text-xs text-[#081120]/50">
                  Odd: <span className="font-bold text-[#0066FF]">{bet.homeOdd}</span>
                </p>
              </div>
              <div className="rounded-xl bg-[#081120]/5 px-3 py-2.5 text-center">
                <p className="text-sm font-bold text-[#081120]">
                  {bet.awayTeamFlag && <span className="mr-1">{bet.awayTeamFlag}</span>}
                  {bet.awayTeamName}
                </p>
                <p className="mt-1 text-xs text-[#081120]/50">
                  Odd: <span className="font-bold text-[#0066FF]">{bet.awayOdd}</span>
                </p>
              </div>
            </div>

            {hasPick ? (
              <div className="rounded-xl bg-[#00C853]/10 px-4 py-3 text-center ring-1 ring-[#00C853]/25">
                <p className="text-xs font-bold uppercase tracking-wide text-[#00C853]">
                  Bet Submitted
                </p>
                <p className="mt-1 text-sm font-bold text-[#081120]">
                  Your Pick: {bet.userPickTeamName}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submitPick(bet.id, bet.homeTeamId)}
                  className={cn(
                    "min-h-[44px] rounded-xl bg-[#0066FF] px-4 text-sm font-bold text-white",
                    "active:scale-[0.98] disabled:opacity-50"
                  )}
                >
                  Bet on {bet.homeTeamName}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => submitPick(bet.id, bet.awayTeamId)}
                  className={cn(
                    "min-h-[44px] rounded-xl bg-[#081120] px-4 text-sm font-bold text-white",
                    "active:scale-[0.98] disabled:opacity-50"
                  )}
                >
                  Bet on {bet.awayTeamName}
                </button>
              </div>
            )}

            {showVoteStats && (
              <div className="mt-4 space-y-1 border-t border-[#081120]/8 pt-3 text-sm text-[#081120]/70">
                <div className="flex justify-between">
                  <span>{bet.homeTeamName}</span>
                  <span className="font-bold">{bet.stats.homeVotes} votes</span>
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
            )}
          </article>
        );
      })}
    </div>
  );
}
