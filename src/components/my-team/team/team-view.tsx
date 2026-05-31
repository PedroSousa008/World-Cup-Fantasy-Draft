"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, Zap, BarChart3 } from "lucide-react";
import { PlayerCard, BenchPlayerCard } from "@/components/my-team/team/player-card";
import { PlayerBottomSheet } from "@/components/my-team/team/player-bottom-sheet";
import {
  MOCK_SQUAD,
  MOCK_TEAM_SUMMARY,
  getNationFlag,
  type SquadPlayer,
} from "@/lib/mock/my-team-data";

interface TeamViewProps {
  teamName: string;
  selectedNation: string;
}

export function TeamView({ teamName, selectedNation }: TeamViewProps) {
  const router = useRouter();
  const [selectedPlayer, setSelectedPlayer] = useState<SquadPlayer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const starters = MOCK_SQUAD.filter((p) => p.isStarter);
  const bench = MOCK_SQUAD.filter((p) => !p.isStarter);
  const flag = getNationFlag(selectedNation);

  const formation = {
    GK: starters.filter((p) => p.position === "GK"),
    DEF: starters.filter((p) => p.position === "DEF"),
    MID: starters.filter((p) => p.position === "MID"),
    FWD: starters.filter((p) => p.position === "FWD"),
  };

  const openPlayer = (player: SquadPlayer) => {
    setSelectedPlayer(player);
    setSheetOpen(true);
  };

  const quickActions = [
    { label: "Captain", icon: Crown, href: undefined as string | undefined },
    { label: "Vice-Cap", icon: Shield, href: undefined as string | undefined },
    { label: "Powers", icon: Zap, href: "/my-team/powers" },
    { label: "Rankings", icon: BarChart3, href: "/my-team/rankings" },
  ];

  return (
    <div className="space-y-5 pb-4">
      {/* Team header */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <h1 className="text-display text-2xl">{teamName}</h1>
        </div>
        <p className="text-body mt-0.5 text-sm">{selectedNation}</p>

        {/* Stat pills */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Rank", value: `#${MOCK_TEAM_SUMMARY.rank}`, accent: "text-[#0066FF]" },
            { label: "Points", value: String(MOCK_TEAM_SUMMARY.totalPoints), accent: "text-[#081120]" },
            { label: "MD Pts", value: String(MOCK_TEAM_SUMMARY.matchdayPoints), accent: "text-[#00C853]" },
          ].map((stat) => (
            <div key={stat.label} className="wc-card p-3 text-center hover:transform-none hover:shadow-sm">
              <p className={`text-xl font-bold tabular-nums ${stat.accent}`}>{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#081120]/45">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                if (action.href) router.push(action.href);
              }}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold text-white transition-all active:scale-[0.97] active:bg-white/15"
            >
              <Icon className="h-4 w-4 text-[#0066FF]" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Mobile pitch */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#00C853]/20 bg-gradient-to-b from-[#00C853]/15 to-[#00C853]/5 p-3">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-white" />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
            Starting XI
          </p>

          <div className="space-y-2">
            {(["FWD", "MID", "DEF", "GK"] as const).map((line) => (
              <div
                key={line}
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(formation[line].length, 1)}, 1fr)`,
                }}
              >
                {formation[line].map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    compact
                    onTap={() => openPlayer(player)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bench — horizontal swipe scroll */}
      <div className="px-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
          Bench
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {bench.map((player) => (
            <BenchPlayerCard
              key={player.id}
              player={player}
              onTap={() => openPlayer(player)}
            />
          ))}
        </div>
      </div>

      <PlayerBottomSheet
        player={selectedPlayer}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
