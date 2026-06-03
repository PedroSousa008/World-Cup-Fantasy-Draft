"use client";

import { useTransition } from "react";
import { submitMatchBetVoteAction } from "@/lib/actions/bets";
import type { MatchBetPick, MatchBetsPayload } from "@/lib/bets/types";
import { usePollJson } from "@/hooks/use-poll-json";
import { cn } from "@/lib/utils";

interface MatchBetsViewProps {
  initial: MatchBetsPayload;
  /** Set on server from platform owner check — never from poll/API. */
  showVoteStats: boolean;
}

export function MatchBetsView({ initial, showVoteStats }: MatchBetsViewProps) {
  const [pending, startTransition] = useTransition();
  const { data, refresh } = usePollJson<MatchBetsPayload>("/api/bets/match-bets", 10_000);

  const payload = data ?? initial;
  const { bets } = payload;

  const submitPick = (promotedBetId: string, pick: MatchBetPick) => {
    startTransition(() => {
      void submitMatchBetVoteAction({ promotedBetId, pick }).then((result) => {
        if (result.ok) void refresh();
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
        const hasPick = bet.userPick != null;
        const matchLabel = `${bet.homeTeamName} vs ${bet.awayTeamName}`;
        const votingOpen = bet.status === "VOTING_OPEN";

        return (
          <article
            key={bet.id}
            className="overflow-hidden rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5"
          >
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#081120]/40">
                {bet.matchday != null ? `MD${bet.matchday}` : "Match"}
                {!votingOpen && (
                  <span className="ml-2 text-[#0066FF]">· Odds published</span>
                )}
              </p>
              <h3 className="text-lg font-bold text-[#081120]">{matchLabel}</h3>
            </div>

            {votingOpen ? (
              hasPick ? (
                <div className="rounded-xl bg-[#00C853]/10 px-4 py-3 text-center ring-1 ring-[#00C853]/25">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#00C853]">
                    Vote submitted
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#081120]">
                    Your Vote: {bet.userPickLabel}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => submitPick(bet.id, "HOME")}
                    className={cn(
                      "min-h-[44px] rounded-xl bg-[#0066FF] px-4 text-sm font-bold text-white",
                      "active:scale-[0.98] disabled:opacity-50"
                    )}
                  >
                    Vote {bet.homeTeamName}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => submitPick(bet.id, "DRAW")}
                    className={cn(
                      "min-h-[44px] rounded-xl bg-[#081120]/10 px-4 text-sm font-bold text-[#081120]",
                      "ring-1 ring-[#081120]/15 active:scale-[0.98] disabled:opacity-50"
                    )}
                  >
                    Vote Draw
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => submitPick(bet.id, "AWAY")}
                    className={cn(
                      "min-h-[44px] rounded-xl bg-[#081120] px-4 text-sm font-bold text-white",
                      "active:scale-[0.98] disabled:opacity-50"
                    )}
                  >
                    Vote {bet.awayTeamName}
                  </button>
                </div>
              )
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#081120]/5 px-2 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-[#081120]/45">
                    {bet.homeTeamName}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#0066FF]">
                    {bet.homeOdd ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#081120]/5 px-2 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-[#081120]/45">Draw</p>
                  <p className="mt-1 text-sm font-black text-[#0066FF]">
                    {bet.drawOdd ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#081120]/5 px-2 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-[#081120]/45">
                    {bet.awayTeamName}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#0066FF]">
                    {bet.awayOdd ?? "—"}
                  </p>
                </div>
              </div>
            )}

            {showVoteStats && (
              <div className="mt-4 space-y-1 border-t border-[#081120]/8 pt-3 text-sm text-[#081120]/70">
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
            )}
          </article>
        );
      })}
    </div>
  );
}
