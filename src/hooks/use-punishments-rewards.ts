"use client";

import { useCallback, useEffect, useState } from "react";
import type { PunishmentsRewardsPayload } from "@/lib/bets/types";
import type { RankingOutcomeRowDto } from "@/lib/bets/types";
import {
  fetchPunishmentsRewards,
  fetchPunishmentsUserRank,
  getCachedPunishmentsRewards,
  seedPunishmentsRewardsCache,
} from "@/lib/bets/punishments-rewards-cache";

const TABLE_POLL_MS = 10_000;
const RANK_POLL_MS = 22_000;

interface UsePunishmentsRewardsOptions {
  initialRows: RankingOutcomeRowDto[];
  initialRank?: number | null;
}

export function usePunishmentsRewards({
  initialRows,
  initialRank = null,
}: UsePunishmentsRewardsOptions) {
  const cached = getCachedPunishmentsRewards();
  const [payload, setPayload] = useState<PunishmentsRewardsPayload>(() => {
    if (cached) return cached;
    return { rows: initialRows, currentUserRank: initialRank };
  });
  const [loading, setLoading] = useState(
    () => initialRows.length === 0 && !cached
  );

  useEffect(() => {
    seedPunishmentsRewardsCache({
      rows: initialRows,
      currentUserRank: initialRank,
    });
  }, [initialRows, initialRank]);

  const syncFromNetwork = useCallback(async (force = false) => {
    try {
      const data = await fetchPunishmentsRewards({ force });
      setPayload(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const syncRank = useCallback(async () => {
    const rank = await fetchPunishmentsUserRank();
    setPayload((prev) => ({ ...prev, currentUserRank: rank }));
  }, []);

  useEffect(() => {
    const cachedNow = getCachedPunishmentsRewards();
    if (cachedNow) {
      setPayload(cachedNow);
      setLoading(false);
    } else if (initialRows.length > 0) {
      setLoading(false);
    }

    void syncFromNetwork(!cachedNow);

    const tableId = window.setInterval(() => void syncFromNetwork(true), TABLE_POLL_MS);
    const rankId = window.setInterval(() => void syncRank(), RANK_POLL_MS);

    return () => {
      window.clearInterval(tableId);
      window.clearInterval(rankId);
    };
    // Mount-only polling setup; initialRows are seeded via seedPunishmentsRewardsCache.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [syncFromNetwork, syncRank]);

  const refresh = useCallback(() => {
    void syncFromNetwork(true);
  }, [syncFromNetwork]);

  return { payload, loading, refresh };
}
