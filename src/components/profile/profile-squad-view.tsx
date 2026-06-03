"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ProfileSquadPayload, ProfileSquadRow } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { ProfileSection } from "@/components/profile/profile-ui";
import { cn } from "@/lib/utils";
type SortKey = "points-desc" | "points-asc" | "position" | "nation";

const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
};

interface ProfileSquadViewProps {
  initialData: ProfileSquadPayload;
}

function sortRows(rows: ProfileSquadRow[], key: SortKey): ProfileSquadRow[] {
  const copy = [...rows];
  switch (key) {
    case "points-desc":
      return copy.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
    case "points-asc":
      return copy.sort((a, b) => a.fantasyPoints - b.fantasyPoints);
    case "position":
      return copy.sort((a, b) => {
        const pa = POSITION_ORDER[a.position] ?? 9;
        const pb = POSITION_ORDER[b.position] ?? 9;
        if (pa !== pb) return pa - pb;
        return b.fantasyPoints - a.fantasyPoints;
      });
    case "nation":
      return copy.sort((a, b) => {
        const cmp = a.nation.localeCompare(b.nation);
        if (cmp !== 0) return cmp;
        return b.fantasyPoints - a.fantasyPoints;
      });
    default:
      return copy;
  }
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "points-desc", label: "Highest Points" },
  { key: "points-asc", label: "Lowest Points" },
  { key: "position", label: "Position" },
  { key: "nation", label: "Nation" },
];

export function ProfileSquadView({ initialData }: ProfileSquadViewProps) {
  const { data } = useProfileTab("squad", initialData);
  const [sort, setSort] = useState<SortKey>("points-desc");
  const sorted = useMemo(() => sortRows(data.rows, sort), [data.rows, sort]);

  return (
    <ProfileSection
      title="Squad Stats"
      description="All players in your fantasy squad. View only — no edits here."
    >
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSort(opt.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              sort === opt.key
                ? "bg-[#0066FF]/20 text-[#0066FF]"
                : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/45">
          No squad players assigned yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <div className="grid grid-cols-[2.5rem_1fr_auto] gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/40 sm:grid-cols-[2.5rem_1fr_3rem_2.5rem_3.5rem]">
            <span />
            <span>Player</span>
            <span className="hidden text-center sm:block">Pos</span>
            <span className="hidden text-center sm:block">Nation</span>
            <span className="text-right">Pts</span>
          </div>
          <ul className="divide-y divide-white/6">
            {sorted.map((row) => (
              <li
                key={row.playerId}
                className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3 py-3 sm:grid-cols-[2.5rem_1fr_3rem_2.5rem_3.5rem]"
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white/10">
                  {row.photoUrl ? (
                    <Image
                      src={row.photoUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/40">
                      {row.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                  <p className="text-[10px] text-white/40 sm:hidden">
                    {row.position} · {row.nationFlag}
                  </p>
                </div>
                <span className="hidden text-center text-xs font-bold text-white/70 sm:block">
                  {row.position}
                </span>
                <span className="hidden text-center text-lg sm:block" aria-hidden>
                  {row.nationFlag}
                </span>
                <span className="text-right text-sm font-bold text-[#0066FF]">
                  {row.fantasyPoints}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ProfileSection>
  );
}
