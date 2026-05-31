"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PillTabs } from "@/components/ui/segmented-control";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import { SHOWCASE_PLAYERS } from "@/lib/mock/showcase-players";
import { MOCK_DRAFT_FEED } from "@/lib/mock/my-team-data";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "GK", label: "GK" },
  { value: "DEF", label: "DEF" },
  { value: "MID", label: "MID" },
  { value: "FWD", label: "FWD" },
];

export function DraftRoomView() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [timer, setTimer] = useState(38);
  const [mode, setMode] = useState<"draft" | "redraft">("draft");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 38));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = SHOWCASE_PLAYERS.filter((p) => {
    if (filter !== "all" && p.position !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="pb-4">
      <div className="space-y-4 px-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("draft")}
            className={`min-h-[44px] flex-1 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
              mode === "draft" ? "bg-[#0066FF] text-white" : "bg-white/10 text-white/60"
            }`}
          >
            Initial Draft
          </button>
          <button
            type="button"
            onClick={() => setMode("redraft")}
            className={`min-h-[44px] flex-1 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
              mode === "redraft" ? "bg-[#0066FF] text-white" : "bg-white/10 text-white/60"
            }`}
          >
            Redraft (10 picks)
          </button>
        </div>

        <div className="wc-card grid grid-cols-2 gap-3 p-4 hover:transform-none">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#081120]/45">Round</p>
            <p className="text-2xl font-bold text-[#081120]">5</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#081120]/45">Pick</p>
            <p className="text-2xl font-bold text-[#081120]">42</p>
          </div>
          <div className="col-span-2 rounded-xl bg-[#0066FF]/8 px-3 py-2">
            <p className="text-xs text-[#0066FF]/70">On the clock</p>
            <p className="font-bold text-[#081120]">Pedro FC is picking</p>
          </div>
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#081120]/50">Timer</span>
            <span
              className={`text-3xl font-bold tabular-nums ${
                timer < 10 ? "text-[#E53935]" : "text-[#081120]"
              }`}
            >
              {formatTime(timer)}
            </span>
          </div>
        </div>

        <p className="rounded-xl bg-[#FFD700]/10 px-3 py-2 text-xs text-[#FFD700]">
          Draft picks grant ownership only. The Owner assigns players to teams after the draft.
        </p>
      </div>

      <div className="sticky top-14 z-30 space-y-3 bg-[#081120]/80 px-4 py-3 backdrop-blur-md">
        <PillTabs options={FILTERS} value={filter} onChange={setFilter} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border-0 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40"
          />
        </div>
      </div>

      <div className="space-y-3 px-4 pt-2">
        <p className="text-xs font-bold uppercase tracking-wide text-white/45">Available Players</p>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((player) => (
            <DraftPlayerTile key={player.id} player={player} onTap={() => router.push(`/my-team/player/${player.id}`)} />
          ))}
        </div>
      </div>

      <div className="mt-6 px-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/45">Live Draft Feed</p>
        <div className="space-y-2">
          {MOCK_DRAFT_FEED.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <p className="text-sm text-white/80">
                <span className="font-bold text-white">{item.manager}</span> drafted{" "}
                <span className="font-bold text-[#00C853]">{item.player}</span>
              </p>
              <span className="text-xs text-white/35">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraftPlayerTile({ player, onTap }: { player: FantasyPlayer; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} className="text-left active:scale-[0.98]">
      <FantasyPlayerCard player={player} size="bench" />
    </button>
  );
}
