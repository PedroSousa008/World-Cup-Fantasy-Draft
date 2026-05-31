"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import { getNationFlag } from "@/lib/mock/my-team-data";

interface PlayerDetailSheetProps {
  player: FantasyPlayer | null;
  open: boolean;
  onClose: () => void;
  isCaptain: boolean;
  isViceCaptain: boolean;
  onReplace: () => void;
  onMakeCaptain: () => void;
  onMakeViceCaptain: () => void;
  onRemove: () => void;
}

export function PlayerDetailSheet({
  player,
  open,
  onClose,
  isCaptain,
  isViceCaptain,
  onReplace,
  onMakeCaptain,
  onMakeViceCaptain,
  onRemove,
}: PlayerDetailSheetProps) {
  if (!player) return null;

  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <BottomSheet open={open} onClose={onClose} title={player.name}>
      <div className="flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0066FF]/20 to-[#00C853]/20 text-3xl font-black text-[#0066FF]">
          {initials}
          {isCaptain && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-black text-white shadow-lg">
              C
            </span>
          )}
          {isViceCaptain && !isCaptain && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#081120] text-xs font-black text-white shadow-lg">
              V
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-[#081120]/60">
          {getNationFlag(player.nation)} {player.nation} · {player.position} · {player.club}
        </p>
        {isCaptain && (
          <span className="mt-2 rounded-full bg-[#0066FF]/10 px-3 py-1 text-xs font-bold text-[#0066FF]">
            Captain — 2× points
          </span>
        )}
        {isViceCaptain && !isCaptain && (
          <span className="mt-2 rounded-full bg-[#081120]/8 px-3 py-1 text-xs font-bold text-[#081120]/60">
            Vice-Captain
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { l: "Goals", v: player.goals },
          { l: "Assists", v: player.assists },
          { l: "YC", v: player.yellowCards },
          { l: "RC", v: player.redCards },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-[#081120]/5 py-2.5 text-center">
            <p className="text-lg font-bold text-[#081120]">{s.v}</p>
            <p className="text-[10px] text-[#081120]/45">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-xl bg-[#0066FF]/8 py-3 text-center">
          <p className="text-2xl font-black text-[#0066FF]">{player.totalPoints}</p>
          <p className="text-xs text-[#081120]/50">Total Pts</p>
        </div>
        <div className="flex-1 rounded-xl bg-[#00C853]/8 py-3 text-center">
          <p className="text-2xl font-black text-[#00C853]">{player.matchdayPoints}</p>
          <p className="text-xs text-[#081120]/50">Matchday</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#0066FF]/15 bg-[#0066FF]/5 px-4 py-3">
        <p className="text-xs font-medium text-[#0066FF]/70">Next Fixture</p>
        <p className="font-semibold text-[#081120]">{player.upcomingFixture}</p>
      </div>

      {player.matchHistory.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase text-[#081120]/40">Statistics</p>
          {player.matchHistory.map((m) => (
            <div key={m.matchday} className="flex justify-between py-2 text-sm border-b border-[#081120]/5 last:border-0">
              <span className="text-[#081120]/60">MD{m.matchday} vs {m.opponent}</span>
              <span className="font-bold">{m.points} pts</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="outline" className="border-[#081120]/15 text-[#081120]" onClick={onReplace}>
          Replace
        </Button>
        <Button
          variant={isCaptain ? "primary" : "outline"}
          className={!isCaptain ? "border-[#081120]/15 text-[#081120]" : ""}
          onClick={onMakeCaptain}
          disabled={isCaptain}
        >
          {isCaptain ? "Captain ✓" : "Make Captain"}
        </Button>
        <Button
          variant="outline"
          className="border-[#081120]/15 text-[#081120]"
          onClick={onMakeViceCaptain}
          disabled={isViceCaptain}
        >
          {isViceCaptain ? "Vice-Cap ✓" : "Make Vice-Cap"}
        </Button>
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </BottomSheet>
  );
}
