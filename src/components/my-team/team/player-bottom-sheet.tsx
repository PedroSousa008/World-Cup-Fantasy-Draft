"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/my-team/team/player-card";
import type { SquadPlayer } from "@/lib/mock/my-team-data";
import { getNationFlag } from "@/lib/mock/my-team-data";

interface PlayerBottomSheetProps {
  player: SquadPlayer | null;
  open: boolean;
  onClose: () => void;
}

export function PlayerBottomSheet({ player, open, onClose }: PlayerBottomSheetProps) {
  if (!player) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title={player.name}>
      <div className="flex flex-col items-center">
        <PlayerAvatar name={player.name} size="lg" />
        <div className="mt-3 flex items-center gap-2 text-sm text-[#081120]/60">
          <span>{getNationFlag(player.nation)} {player.nation}</span>
          <span>·</span>
          <span className="font-semibold">{player.position}</span>
          <span>·</span>
          <span>{player.club}</span>
        </div>
        {(player.isCaptain || player.isViceCaptain) && (
          <span className="mt-2 rounded-full bg-[#0066FF]/10 px-3 py-1 text-xs font-bold text-[#0066FF]">
            {player.isCaptain ? "Captain" : "Vice Captain"}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          { label: "Goals", value: player.goals },
          { label: "Assists", value: player.assists },
          { label: "YC", value: player.yellowCards },
          { label: "RC", value: player.redCards },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-[#081120]/5 py-3 text-center"
          >
            <p className="text-lg font-bold tabular-nums text-[#081120]">{stat.value}</p>
            <p className="text-[10px] font-medium text-[#081120]/45">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-xl bg-[#0066FF]/8 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-[#0066FF]">
            {player.totalPoints}
          </p>
          <p className="text-xs text-[#081120]/50">Total Points</p>
        </div>
        <div className="flex-1 rounded-xl bg-[#00C853]/8 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-[#00C853]">
            {player.matchdayPoints}
          </p>
          <p className="text-xs text-[#081120]/50">Matchday</p>
        </div>
      </div>

      {player.matchHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-[#081120]">Match History</h3>
          <div className="space-y-2">
            {player.matchHistory.map((m) => (
              <div
                key={m.matchday}
                className="flex items-center justify-between rounded-xl bg-[#081120]/5 px-4 py-3"
              >
                <span className="text-sm text-[#081120]/70">
                  MD{m.matchday} vs {m.opponent}
                </span>
                <span className="text-sm font-bold tabular-nums text-[#081120]">
                  {m.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {player.upcomingMatch && (
        <div className="mt-4 rounded-xl border border-[#0066FF]/20 bg-[#0066FF]/5 px-4 py-3">
          <p className="text-xs font-medium text-[#0066FF]/70">Upcoming</p>
          <p className="text-sm font-semibold text-[#081120]">{player.upcomingMatch}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1 border-[#081120]/15 text-[#081120]" onClick={onClose}>
          Close
        </Button>
        <Button className="flex-1" disabled>
          Set Captain
        </Button>
      </div>
    </BottomSheet>
  );
}
