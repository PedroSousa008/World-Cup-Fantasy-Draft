"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DraftPlayerCardTile } from "@/components/my-team/draft/draft-player-card";
import { useIncrementalList } from "@/hooks/use-incremental-list";
import type { DraftPlayerCard } from "@/lib/draft/types";

interface DraftPlayerGridProps {
  players: DraftPlayerCard[];
  savedSet: Set<string>;
  onToggleSaved: (playerId: string, isSaved: boolean) => void;
}

function DraftPlayerGridInner({ players, savedSet, onToggleSaved }: DraftPlayerGridProps) {
  const router = useRouter();
  const { visible, hasMore, sentinelRef } = useIncrementalList(players, 24);

  const handleClick = useCallback(
    (id: string) => {
      router.push(`/my-team/player/${id}?from=draft`);
    },
    [router]
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {visible.map((player) => (
          <DraftPlayerCardTile
            key={player.id}
            player={player}
            isSaved={savedSet.has(player.id)}
            onToggleSaved={() => onToggleSaved(player.id, savedSet.has(player.id))}
            onClick={() => handleClick(player.id)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <span className="text-xs text-white/40">Loading more…</span>
        </div>
      )}
    </>
  );
}

export const DraftPlayerGrid = memo(DraftPlayerGridInner);
