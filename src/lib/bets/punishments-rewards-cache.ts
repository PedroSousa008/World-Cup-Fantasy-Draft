import type { PunishmentsRewardsPayload } from "@/lib/bets/types";

const STALE_MS = 12_000;
const RANK_STALE_MS = 25_000;

interface CacheEntry {
  data: PunishmentsRewardsPayload;
  fetchedAt: number;
  promise?: Promise<PunishmentsRewardsPayload>;
}

let cache: CacheEntry | null = null;

export function getCachedPunishmentsRewards(): PunishmentsRewardsPayload | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > STALE_MS) return null;
  return cache.data;
}

export function isPunishmentsRewardsCacheStale(): boolean {
  if (!cache) return true;
  return Date.now() - cache.fetchedAt > STALE_MS;
}

export function seedPunishmentsRewardsCache(data: PunishmentsRewardsPayload): void {
  cache = { data, fetchedAt: Date.now() };
}

export function patchPunishmentsRewardsCache(
  patch: Partial<PunishmentsRewardsPayload>
): void {
  if (!cache?.data) return;
  cache = {
    data: { ...cache.data, ...patch },
    fetchedAt: Date.now(),
  };
}

export function invalidatePunishmentsRewardsCache(): void {
  cache = null;
}

export async function fetchPunishmentsRewards(options?: {
  force?: boolean;
}): Promise<PunishmentsRewardsPayload> {
  const force = options?.force ?? false;

  if (!force && cache && Date.now() - cache.fetchedAt <= STALE_MS) {
    return cache.data;
  }

  if (!force && cache?.promise) {
    return cache.promise;
  }

  const promise = fetch("/api/bets/punishments-rewards", {
    credentials: "same-origin",
  }).then(async (res) => {
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "Failed to load");
    }
    return res.json() as Promise<PunishmentsRewardsPayload>;
  });

  cache = { ...(cache ?? { data: { rows: [], currentUserRank: null }, fetchedAt: 0 }), promise };

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

export function prefetchPunishmentsRewards(): void {
  if (!isPunishmentsRewardsCacheStale() || cache?.promise) return;
  void fetchPunishmentsRewards().catch(() => {});
}

/** Refresh rank only (lighter than full table when rows unchanged). */
export async function fetchPunishmentsUserRank(): Promise<number | null> {
  if (cache && Date.now() - cache.fetchedAt <= RANK_STALE_MS) {
    return cache.data.currentUserRank;
  }

  const res = await fetch("/api/bets/punishments-rewards/rank", {
    credentials: "same-origin",
  });
  if (!res.ok) return cache?.data.currentUserRank ?? null;
  const body = (await res.json()) as { currentUserRank: number | null };
  patchPunishmentsRewardsCache({ currentUserRank: body.currentUserRank });
  return body.currentUserRank;
}
