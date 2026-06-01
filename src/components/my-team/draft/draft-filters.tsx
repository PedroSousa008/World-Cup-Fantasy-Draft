"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRAFT_NATIONS, DRAFT_POSITIONS } from "@/lib/draft/nations";
import type { DraftFilterState } from "@/lib/draft/types";
import type { PlayerPosition } from "@/lib/players/types";

interface DraftFiltersProps {
  filters: DraftFilterState;
  onChange: (filters: DraftFilterState) => void;
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[36px] shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97]",
        active ? "bg-[#0066FF] text-white shadow-sm" : "bg-white/10 text-white/65"
      )}
    >
      {label}
    </button>
  );
}

export function DraftFilters({ filters, onChange }: DraftFiltersProps) {
  const [nationsOpen, setNationsOpen] = useState(false);
  const selectedNationsCount = filters.nations.length;

  const setPosition = (position: PlayerPosition | null) => {
    onChange({ ...filters, position });
  };

  const toggleNation = (nation: string) => {
    const nations = filters.nations.includes(nation)
      ? filters.nations.filter((n) => n !== nation)
      : [...filters.nations, nation];
    onChange({ ...filters, nations });
  };

  const clearNations = () => onChange({ ...filters, nations: [] });

  const nationLabel = useMemo(() => {
    if (selectedNationsCount === 0) return "Nation";
    if (selectedNationsCount === 1) return filters.nations[0] ?? "Nation";
    return `Nations (${selectedNationsCount})`;
  }, [filters.nations, selectedNationsCount]);

  return (
    <div className="space-y-3">
      {/* Position */}
      <div className="flex flex-wrap gap-1.5 pb-0.5">
        <FilterPill active={filters.position === null} onClick={() => setPosition(null)} label="All" />
        {DRAFT_POSITIONS.map((pos) => (
          <FilterPill
            key={pos.value}
            active={filters.position === pos.value}
            onClick={() => setPosition(pos.value as PlayerPosition)}
            label={pos.label}
          />
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-11 w-full rounded-xl border-0 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
        />
      </div>

      {/* Nation multi-select */}
      <div>
        <button
          type="button"
          onClick={() => setNationsOpen(!nationsOpen)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            {nationLabel}
            {selectedNationsCount > 0 && (
              <span className="rounded-full bg-[#0066FF] px-2 py-0.5 text-xs">
                {selectedNationsCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 text-white/50 transition-transform", nationsOpen && "rotate-180")}
          />
        </button>

        {nationsOpen && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0B1526]/95 p-2">
            {selectedNationsCount > 0 && (
              <button
                type="button"
                onClick={clearNations}
                className="mb-2 flex w-full items-center justify-center gap-1 rounded-lg bg-white/5 py-1.5 text-xs font-semibold text-white/60"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}

            <div className="grid grid-cols-2 gap-1">
              {DRAFT_NATIONS.map((nation) => {
                const selected = filters.nations.includes(nation);
                return (
                  <button
                    key={nation}
                    type="button"
                    onClick={() => toggleNation(nation)}
                    className={cn(
                      "truncate rounded-lg px-2 py-2 text-left text-[11px] font-medium transition-colors",
                      selected ? "bg-[#0066FF] text-white" : "text-white/70 hover:bg-white/5"
                    )}
                    title={nation}
                  >
                    {nation}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

