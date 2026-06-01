import type { DraftData } from "@/lib/draft/types";

const STALE_MS = 45_000;

interface CacheEntry {
  data: DraftData;
  fetchedAt: number;
  promise?: Promise<DraftData>;
}

let cache: CacheEntry | null = null;

export function getCachedDraft(): DraftData | null {
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > STALE_MS) return null;
  return cache.data;
}

export function isDraftCacheStale(): boolean {
  if (!cache) return true;
  return Date.now() - cache.fetchedAt > STALE_MS;
}

export function invalidateDraftCache(): void {
  cache = null;
}

export function updateCachedDraftSavedIds(savedPlayerIds: string[]): void {
  if (!cache?.data) return;
  cache = {
    ...cache,
    data: { ...cache.data, savedPlayerIds },
  };
}

export async function fetchDraftData(options?: {
  force?: boolean;
}): Promise<DraftData> {
  const force = options?.force ?? false;

  if (!force && cache && Date.now() - cache.fetchedAt <= STALE_MS) {
    return cache.data;
  }

  if (!force && cache?.promise) {
    return cache.promise;
  }

  const promise = fetch("/api/my-team/draft", { credentials: "same-origin" }).then(
    async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to load draft");
      }
      return res.json() as Promise<DraftData>;
    }
  );

  cache = { ...(cache ?? { data: { players: [], savedPlayerIds: [] }, fetchedAt: 0 }), promise };

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

export function prefetchDraftData(): void {
  if (!isDraftCacheStale() || cache?.promise) return;
  void fetchDraftData().catch(() => {});
}
