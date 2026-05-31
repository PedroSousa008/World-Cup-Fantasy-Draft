"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillTabs } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { SquadSlot } from "@/lib/squad/formations";
import { getNationFlag } from "@/lib/mock/my-team-data";

interface PlayerPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  slot: SquadSlot | null;
  players: FantasyPlayer[];
  assignedIds: Set<string>;
  onSelect: (playerId: string) => void;
  onViewProfile: (playerId: string) => void;
}

const POSITION_FILTERS = [
  { value: "all", label: "All" },
  { value: "GK", label: "GK" },
  { value: "DEF", label: "DEF" },
  { value: "MID", label: "MID" },
  { value: "FWD", label: "FWD" },
];

const NATION_FILTERS = [
  { value: "all", label: "All Nations" },
  { value: "Portugal", label: "🇵🇹 POR" },
  { value: "France", label: "🇫🇷 FRA" },
  { value: "Brazil", label: "🇧🇷 BRA" },
  { value: "England", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG" },
];

export function PlayerPickerDrawer({
  open,
  onClose,
  slot,
  players,
  assignedIds,
  onSelect,
  onViewProfile,
}: PlayerPickerDrawerProps) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [nationFilter, setNationFilter] = useState("all");
  const [draftedFilter, setDraftedFilter] = useState<"all" | "available" | "drafted">("all");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (slot?.zone === "starter" && p.position !== slot.position) return false;
      if (posFilter !== "all" && p.position !== posFilter) return false;
      if (nationFilter !== "all" && p.nation !== nationFilter) return false;
      if (draftedFilter === "available" && assignedIds.has(p.id)) return false;
      if (draftedFilter === "drafted" && !assignedIds.has(p.id)) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (assignedIds.has(p.id)) return false;
      return true;
    });
  }, [players, slot, posFilter, nationFilter, draftedFilter, search, assignedIds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-[#081120]">
      <div className="wc-glass flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs text-white/45">Select Player</p>
          <p className="font-bold text-white">
            {slot ? (slot.zone === "bench" ? "Bench Slot" : slot.position) : "Player"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 border-b border-white/8 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border-0 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
          />
        </div>
        <PillTabs options={POSITION_FILTERS} value={posFilter} onChange={setPosFilter} />
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {NATION_FILTERS.map((n) => (
            <button
              key={n.value}
              type="button"
              onClick={() => setNationFilter(n.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                nationFilter === n.value ? "bg-[#0066FF] text-white" : "bg-white/10 text-white/60"
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "available", "drafted"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDraftedFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize",
                draftedFilter === f ? "bg-white/15 text-white" : "text-white/45"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-[env(safe-area-inset-bottom)]">
        <div className="space-y-2">
          {filtered.map((player) => (
            <div
              key={player.id}
              className="wc-card flex items-center gap-3 p-3 hover:transform-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF]/15 to-[#00C853]/15 text-sm font-bold text-[#0066FF]">
                {player.name.split(" ").pop()?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-[#081120]">{player.name}</p>
                <p className="text-xs text-[#081120]/50">
                  {getNationFlag(player.nation)} {player.position} · £{player.price}m · {player.totalPoints} pts
                </p>
                <p className="text-[10px] text-[#0066FF]">{player.upcomingFixture}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <Button size="sm" onClick={() => onSelect(player.id)}>
                  Select
                </Button>
                <button
                  type="button"
                  onClick={() => onViewProfile(player.id)}
                  className="text-[10px] font-semibold text-[#0066FF]"
                >
                  Profile
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-white/40">No players match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
