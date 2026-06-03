import { loadLeaguePointsContext, invalidateLeaguePointsContext } from "@/lib/rankings/league-points-context";
import {
  computeUserAutomaticPoints,
  computeUserTotalPoints,
} from "@/lib/rankings/user-total-points";

const CACHE_TTL_MS = 25_000;

interface RankCacheEntry {
  rankByUserId: Map<string, number>;
  computedAt: number;
  promise?: Promise<Map<string, number>>;
}

let cache: RankCacheEntry | null = null;

async function computeLeagueRankIndex(): Promise<Map<string, number>> {
  const ctx = await loadLeaguePointsContext();

  const entries = ctx.users.map((user) => {
    const automaticPoints = computeUserAutomaticPoints(
      user.id,
      ctx.matchdays,
      ctx.scoringCtx,
      ctx.powerIndex
    );
    return {
      userId: user.id,
      teamName: user.teamName,
      points: computeUserTotalPoints(
        automaticPoints,
        user.manualPointsAdjustment,
        user.predictionPoints
      ),
    };
  });

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.teamName.localeCompare(b.teamName);
  });

  const rankByUserId = new Map<string, number>();
  entries.forEach((entry, index) => {
    rankByUserId.set(entry.userId, index + 1);
  });

  return rankByUserId;
}

/** Cached overall league ranks (userId → 1-based position). Shared across requests. */
export async function getLeagueRankIndex(): Promise<Map<string, number>> {
  if (cache && Date.now() - cache.computedAt <= CACHE_TTL_MS) {
    return cache.rankByUserId;
  }

  if (cache?.promise) {
    return cache.promise;
  }

  const promise = computeLeagueRankIndex();
  cache = { ...(cache ?? { rankByUserId: new Map(), computedAt: 0 }), promise };

  try {
    const rankByUserId = await promise;
    cache = { rankByUserId, computedAt: Date.now() };
    return rankByUserId;
  } catch (err) {
    if (cache?.promise === promise) {
      cache = cache.computedAt > 0 ? cache : null;
    }
    throw err;
  }
}

export async function getUserLeagueRankCached(userId: string): Promise<number | null> {
  const index = await getLeagueRankIndex();
  return index.get(userId) ?? null;
}

export function invalidateLeagueRankIndex(): void {
  cache = null;
  invalidateLeaguePointsContext();
}
