"use client";

import { useEffect } from "react";
import { prefetchPunishmentsRewards } from "@/lib/bets/punishments-rewards-cache";
import { prefetchRankingsData } from "@/lib/rankings/rankings-cache";

/** Warm punishments table + league rank cache when user enters Bets. */
export function BetsSectionPrefetch() {
  useEffect(() => {
    prefetchPunishmentsRewards();
    prefetchRankingsData();
  }, []);

  return null;
}
