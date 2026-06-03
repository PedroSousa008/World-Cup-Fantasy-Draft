"use client";

import { memo, useMemo, useState } from "react";
import type { ProfileSquadRow } from "@/lib/profile/types";
import type { ProfileSquadPayload } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { ProfileSection } from "@/components/profile/profile-ui";
import { ProfileSquadSkeleton } from "@/components/profile/profile-tab-skeleton";
import { cn } from "@/lib/utils";

type SortKey = "points-desc" | "points-asc" | "position" | "nation";

const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
};

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

const SquadRow = memo(function SquadRow({ row }: { row: ProfileSquadRow }) {
  return (
    <li className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[2rem_1fr_2.5rem_2rem_3rem]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
        {row.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.photoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <span className="text-[9px] font-bold text-white/40">
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
      <span className="hidden text-center text-base sm:block" aria-hidden>
        {row.nationFlag}
      </span>
      <span className="text-right text-sm font-bold tabular-nums text-[#0066FF]">
        {row.fantasyPoints}
      </span>
    </li>
  );
});

export function ProfileSquadView() {
  const { data, loading } = useProfileTab<ProfileSquadPayload>("squad");
  const [sort, setSort] = useState<SortKey>("points-desc");
  const sorted = useMemo(
    () => (data ? sortRows(data.rows, sort) : []),
    [data, sort]
  );

  if (loading || !data) {
    return <ProfileSquadSkeleton />;
  }

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
          <div className="grid grid-cols-[2rem_1fr_auto] gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40 sm:grid-cols-[2rem_1fr_2.5rem_2rem_3rem]">
            <span />
            <span>Player</span>
            <span className="hidden text-center sm:block">Pos</span>
            <span className="hidden text-center sm:block">Nation</span>
            <span className="text-right">Pts</span>
          </div>
          <ul className="divide-y divide-white/6">
            {sorted.map((row) => (
              <SquadRow key={row.playerId} row={row} />
            ))}
          </ul>
        </div>
      )}
    </ProfileSection>
  );
}
