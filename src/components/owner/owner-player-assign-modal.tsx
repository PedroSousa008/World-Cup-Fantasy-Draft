"use client";

import { useEffect, useMemo, useState } from "react";
import { DraftFilters } from "@/components/my-team/draft/draft-filters";
import {
  WorldCupPlayerCard,
  draftCardToWorldCup,
} from "@/components/player/world-cup-player-card";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIncrementalList } from "@/hooks/use-incremental-list";
import type { DraftPlayerCard, DraftFilterState } from "@/lib/draft/types";
import { filterDraftPlayers } from "@/lib/draft/types";
import { getOwnerRosterPositionLabel } from "@/lib/owner/owner-roster-slots";
import type { PlayerPosition } from "@/lib/players/types";

interface OwnerPlayerAssignModalProps {
  open: boolean;
  onClose: () => void;
  slotPosition: PlayerPosition;
  teamName: string;
  players: DraftPlayerCard[];
  onSelect: (playerId: string) => void;
}

export function OwnerPlayerAssignModal({
  open,
  onClose,
  slotPosition,
  teamName,
  players,
  onSelect,
}: OwnerPlayerAssignModalProps) {
  const [filters, setFilters] = useState<DraftFilterState>({
    position: slotPosition,
    search: "",
    nations: [],
  });

  useEffect(() => {
    if (!open) return;
    setFilters({ position: slotPosition, search: "", nations: [] });
  }, [open, slotPosition]);

  const debouncedSearch = useDebouncedValue(filters.search, 200);
  const filtersForQuery = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filtered = useMemo(
    () =>
      filterDraftPlayers(players, filtersForQuery, {
        onlyUnassigned: true,
      }),
    [players, filtersForQuery]
  );

  const { visible, hasMore, sentinelRef } = useIncrementalList(filtered, 24);

  const positionLabel = getOwnerRosterPositionLabel(slotPosition);

  return (
    <MobileFullScreenModal
      open={open}
      onClose={onClose}
      title="Add Player"
      subtitle={`${teamName} · ${positionLabel}`}
    >
      <div className="space-y-4">
        <DraftFilters
          filters={filters}
          onChange={(next) =>
            setFilters({
              ...next,
              position: next.position ?? slotPosition,
            })
          }
        />

        <p className="text-xs font-bold uppercase tracking-wide text-white/45">
          Available players
          {filtered.length > 0 && (
            <span className="ml-1 font-normal normal-case text-white/30">
              · {filtered.length} shown
            </span>
          )}
        </p>

        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-white/95 p-6 text-center text-sm text-[#081120]/60">
            No unassigned {positionLabel.toLowerCase()}s match your filters.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {visible.map((player) => (
                <WorldCupPlayerCard
                  key={player.id}
                  player={draftCardToWorldCup(player)}
                  size="draft"
                  onClick={() => onSelect(player.id)}
                  footer={
                    <p className="truncate px-1 py-1 text-center text-[8px] font-semibold text-white/70">
                      {player.totalPoints} pts · Available
                    </p>
                  }
                />
              ))}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                <span className="text-xs text-white/40">Loading more…</span>
              </div>
            )}
          </>
        )}
      </div>
    </MobileFullScreenModal>
  );
}
