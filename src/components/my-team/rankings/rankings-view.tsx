"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import { getShowcasePlayer } from "@/lib/mock/showcase-players";
import {
  MOCK_OVERALL_RANKINGS,
  MOCK_MATCHDAY_RANKINGS,
  MOCK_PLAYER_RANKINGS,
  MOCK_SPECIAL_RANKINGS,
  getNationFlag,
} from "@/lib/mock/my-team-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const RANKING_TABS = [
  { value: "overall", label: "Overall" },
  { value: "matchday", label: "Matchday" },
  { value: "players", label: "Players" },
  { value: "special", label: "Special" },
];

function MovementBadge({ movement }: { movement: number }) {
  if (movement === 0) return <span className="text-[#081120]/30">—</span>;
  const up = movement > 0;
  return (
    <span
      className={cn(
        "text-sm font-bold tabular-nums",
        up ? "text-[#00C853]" : "text-[#E53935]"
      )}
    >
      {up ? "↑" : "↓"}
      {Math.abs(movement)}
    </span>
  );
}

function RankingCard({
  rank,
  teamName,
  nation,
  points,
  movement,
  highlight,
}: {
  rank: number;
  teamName: string;
  nation: string;
  points: number;
  movement: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "wc-card flex items-center gap-3 p-4 hover:transform-none",
        highlight && "ring-2 ring-[#0066FF]/30"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          rank === 1
            ? "bg-[#0066FF] text-white"
            : rank <= 3
              ? "bg-[#0066FF]/15 text-[#0066FF]"
              : "bg-[#081120]/8 text-[#081120]/60"
        )}
      >
        #{rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#081120]">
          {teamName} {getNationFlag(nation)}
        </p>
        <p className="text-sm tabular-nums text-[#081120]/50">{points} pts</p>
      </div>
      <MovementBadge movement={movement} />
    </div>
  );
}

export function RankingsView() {
  const router = useRouter();
  const [tab, setTab] = useState("overall");

  return (
    <div className="space-y-4 px-4 pb-4">
      <div>
        <h2 className="text-display text-xl">Rankings</h2>
        <p className="text-body text-sm">Competition standings & bragging rights</p>
      </div>

      <SegmentedControl options={RANKING_TABS} value={tab} onChange={setTab} />

      {tab === "overall" && (
        <div className="space-y-2">
          {MOCK_OVERALL_RANKINGS.map((entry) => (
            <RankingCard
              key={entry.rank}
              {...entry}
              highlight={entry.teamName === "Pedro FC"}
            />
          ))}
        </div>
      )}

      {tab === "matchday" && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
            Matchday 2
          </p>
          {MOCK_MATCHDAY_RANKINGS.map((entry) => (
            <RankingCard
              key={entry.rank}
              {...entry}
              highlight={entry.teamName === "Pedro FC"}
            />
          ))}
        </div>
      )}

      {tab === "players" && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {MOCK_PLAYER_RANKINGS.map((item) => {
            const player = getShowcasePlayer(item.player);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => player && router.push(`/my-team/player/${player.id}`)}
                className="w-[160px] shrink-0 snap-start text-left active:scale-[0.98]"
              >
                {player ? (
                  <FantasyPlayerCard player={player} size="bench" />
                ) : (
                  <div className="wc-card w-[160px] p-4 hover:transform-none">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#0066FF]">
                      {item.label}
                    </p>
                    <p className="mt-2 truncate text-base font-bold text-[#081120]">{item.player}</p>
                    <p className="text-sm text-[#081120]/50">
                      {getNationFlag(item.nation)} {item.value}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === "special" && (
        <div className="space-y-3">
          {MOCK_SPECIAL_RANKINGS.map((item) => (
            <div
              key={item.title}
              className="wc-card flex items-center gap-4 p-4 hover:transform-none"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF]/10 text-2xl">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#081120]/45">
                  {item.title}
                </p>
                <p className="font-bold text-[#081120]">{item.leader}</p>
                <p className="text-sm text-[#00C853]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
