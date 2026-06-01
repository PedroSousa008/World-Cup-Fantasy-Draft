"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { DraftFilters } from "@/components/my-team/draft/draft-filters";
import { DraftPlayerGrid } from "@/components/my-team/draft/draft-player-grid";
import { useDraftData } from "@/contexts/draft-data-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  filterDraftPlayers,
  type DraftData,
  type DraftFilterState,
  type DraftMode,
} from "@/lib/draft/types";
import { savePlayerAction, unsavePlayerAction } from "@/lib/actions/saved-players";
import { cn } from "@/lib/utils";

const DRAFT_MODES: { value: DraftMode; label: string }[] = [
  { value: "initial", label: "Initial Draft" },
  { value: "redraft", label: "Redraft" },
  { value: "saved", label: "Saved Players" },
];

interface DraftRoomViewProps {
  data: DraftData;
}

export function DraftRoomView({ data }: DraftRoomViewProps) {
  const { patchSavedIds } = useDraftData();
  const [mode, setMode] = useState<DraftMode>("initial");
  const [filters, setFilters] = useState<DraftFilterState>({
    position: null,
    search: "",
    nations: [],
  });
  const [, startTransition] = useTransition();

  const debouncedSearch = useDebouncedValue(filters.search, 200);
  const filtersForQuery = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const savedSet = useMemo(() => new Set(data.savedPlayerIds), [data.savedPlayerIds]);

  const unassignedPlayers = useMemo(
    () => data.players.filter((p) => !p.isAssigned),
    [data.players]
  );

  const filtered = useMemo(() => {
    if (mode === "initial") {
      return filterDraftPlayers(data.players, filtersForQuery);
    }
    if (mode === "redraft") {
      return filterDraftPlayers(unassignedPlayers, filtersForQuery);
    }
    return filterDraftPlayers(data.players, filtersForQuery, {
      savedIds: data.savedPlayerIds,
    });
  }, [mode, data.players, unassignedPlayers, data.savedPlayerIds, filtersForQuery]);

  const handleToggleSaved = useCallback(
    (playerId: string, isSaved: boolean) => {
      startTransition(() => {
        void (async () => {
          const result = isSaved
            ? await unsavePlayerAction(playerId)
            : await savePlayerAction(playerId);
          if (!result.ok) return;

          const next = isSaved
            ? data.savedPlayerIds.filter((id) => id !== playerId)
            : [...data.savedPlayerIds, playerId];
          patchSavedIds(next);
        })();
      });
    },
    [data.savedPlayerIds, patchSavedIds]
  );

  const emptyMessage =
    mode === "saved"
      ? "You haven't saved any players yet. Tap a player and use Save Player to add them here."
      : mode === "redraft"
        ? "No unassigned players match your filters."
        : "No players have been added yet. The Owner will create players for the league.";

  return (
    <div className="overflow-x-hidden pb-6">
      <div className="space-y-4 px-4">
        <div>
          <h2 className="text-display text-xl">Draft</h2>
          <p className="text-body text-sm">Browse players and track ownership</p>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/8 p-0.5">
          {DRAFT_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                "min-h-[40px] rounded-lg px-1 py-1.5 text-center text-[10px] font-bold leading-tight active:scale-[0.97]",
                mode === m.value ? "bg-[#0066FF] text-white shadow-sm" : "text-white/50"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode !== "saved" ? (
          <DraftFilters filters={filters} onChange={setFilters} />
        ) : (
          <DraftFilters filters={filters} onChange={setFilters} />
        )}
      </div>

      <div className="mt-4 px-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/45">
          {mode === "initial" && "All Players"}
          {mode === "redraft" && "Available Players"}
          {mode === "saved" && `Saved Players (${data.savedPlayerIds.length})`}
          {filtered.length > 0 && (
            <span className="ml-1 font-normal normal-case text-white/30">
              · {filtered.length} shown
            </span>
          )}
        </p>

        {mode === "saved" && data.savedPlayerIds.length === 0 ? (
          <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
            <p className="text-sm font-medium text-[#081120]/60">{emptyMessage}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
            <p className="text-sm font-medium text-[#081120]/60">{emptyMessage}</p>
          </div>
        ) : (
          <DraftPlayerGrid
            players={filtered}
            savedSet={savedSet}
            onToggleSaved={handleToggleSaved}
          />
        )}
      </div>
    </div>
  );
}
