"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SegmentedControl, PillTabs } from "@/components/ui/segmented-control";
import { TeamRankingCard } from "@/components/my-team/rankings/team-ranking-card";
import { PlayerRankingCard } from "@/components/my-team/rankings/player-ranking-card";
import type { RankingsData } from "@/lib/rankings/types";

const RANKING_TABS = [
  { value: "overall", label: "Overall" },
  { value: "matchday", label: "Matchday" },
  { value: "players", label: "Players" },
];

interface RankingsViewProps {
  data: RankingsData;
}

export function RankingsView({ data }: RankingsViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState("overall");
  const [matchday, setMatchday] = useState(String(data.defaultMatchday));

  const matchdayRows = data.matchdayRankings[Number(matchday)] ?? [];

  return (
    <div className="space-y-4 overflow-x-hidden px-4 pb-4">
      <div>
        <h2 className="text-display text-xl">Rankings</h2>
        <p className="text-body text-sm">Live league standings from real data</p>
      </div>

      <SegmentedControl options={RANKING_TABS} value={tab} onChange={setTab} />

      {tab === "overall" && (
        <div className="space-y-2">
          {data.overall.map((row) => (
            <TeamRankingCard
              key={row.rank}
              row={row}
              highlight={!row.isEmpty && row.teamName === data.currentUserTeamName}
            />
          ))}
        </div>
      )}

      {tab === "matchday" && (
        <div className="space-y-3">
          <PillTabs
            options={data.matchdays.map((md) => ({
              value: String(md),
              label: `Matchday ${md}`,
            }))}
            value={matchday}
            onChange={setMatchday}
            className="scroll-contain-x"
          />

          <div className="space-y-2">
            {matchdayRows.map((row) => (
              <TeamRankingCard
                key={row.rank}
                row={row}
                highlight={!row.isEmpty && row.teamName === data.currentUserTeamName}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "players" && (
        <div className="space-y-2">
          {data.players.length === 0 ? (
            <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
              <p className="font-semibold text-[#081120]/60">No players yet</p>
              <p className="mt-1 text-sm text-[#081120]/40">
                The Owner has not added any players to the league.
              </p>
            </div>
          ) : (
            data.players.map((row) => (
              <PlayerRankingCard
                key={row.playerId}
                row={row}
                onClick={() =>
                  router.push(`/my-team/player/${row.playerId}?from=rankings`)
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
