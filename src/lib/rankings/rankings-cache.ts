import type { RankingsData } from "@/lib/rankings/types";

const STALE_MS = 45_000;

interface CacheEntry {
  data: RankingsData;
  fetchedAt: number;
  promise?: Promise<RankingsData>;
}

let cache: CacheEntry | null = null;

export function getCachedRankings(): RankingsData | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > STALE_MS) return null;
  return cache.data;
}

export function isRankingsCacheStale(): boolean {
  if (!cache) return true;
  return Date.now() - cache.fetchedAt > STALE_MS;
}

export function invalidateRankingsCache(): void {
  cache = null;
}

export async function fetchRankingsData(options?: {
  force?: boolean;
}): Promise<RankingsData> {
  const force = options?.force ?? false;

  if (!force && cache && Date.now() - cache.fetchedAt <= STALE_MS) {
    return cache.data;
  }

  if (!force && cache?.promise) {
    return cache.promise;
  }

  const promise = fetch("/api/my-team/rankings", { credentials: "same-origin" }).then(
    async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to load rankings");
      }
      return res.json() as Promise<RankingsData>;
    }
  );

  cache = { ...(cache ?? { data: {} as RankingsData, fetchedAt: 0 }), promise };

  try {
    const data = await promise;
    cache = { data, fetchedAt: Date.now() };
    return data;
  } catch (err) {
    if (cache?.promise === promise) {
      cache = cache.fetchedAt > 0 ? { data: cache.data, fetchedAt: cache.fetchedAt } : null;
    }
    throw err;
  }
}

export function prefetchRankingsData(): void {
  if (!isRankingsCacheStale() || cache?.promise) return;
  void fetchRankingsData().catch(() => {});
}
