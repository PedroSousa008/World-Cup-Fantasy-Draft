import type { ProfileTabPayload, ProfileTabSlug } from "@/lib/profile/types";

/** Background refresh interval while a tab is open. */
const REFRESH_MS = 12_000;
/** Keep showing cached data this long (instant revisit). */
const DISPLAY_MAX_MS = 5 * 60_000;

type TabCache = {
  data: ProfileTabPayload;
  fetchedAt: number;
  promise?: Promise<ProfileTabPayload>;
};

const tabCaches = new Map<ProfileTabSlug, TabCache>();

export function getCachedProfileTabForDisplay(
  tab: ProfileTabSlug
): ProfileTabPayload | null {
  const entry = tabCaches.get(tab);
  if (!entry || entry.fetchedAt <= 0) return null;
  if (Date.now() - entry.fetchedAt > DISPLAY_MAX_MS) return null;
  return entry.data;
}

/** @deprecated use getCachedProfileTabForDisplay */
export function getCachedProfileTab(tab: ProfileTabSlug): ProfileTabPayload | null {
  return getCachedProfileTabForDisplay(tab);
}

export function shouldRefreshProfileTab(tab: ProfileTabSlug): boolean {
  const entry = tabCaches.get(tab);
  if (!entry || entry.fetchedAt <= 0) return true;
  return Date.now() - entry.fetchedAt > REFRESH_MS;
}

export function isProfileTabCacheStale(tab: ProfileTabSlug): boolean {
  return shouldRefreshProfileTab(tab);
}

export function seedProfileTabCache(tab: ProfileTabSlug, data: ProfileTabPayload): void {
  tabCaches.set(tab, { data, fetchedAt: Date.now() });
}

export function invalidateProfileTabCache(tab?: ProfileTabSlug): void {
  if (tab) {
    tabCaches.delete(tab);
    return;
  }
  tabCaches.clear();
}

export async function fetchProfileTab(
  tab: ProfileTabSlug,
  options?: { force?: boolean; background?: boolean }
): Promise<ProfileTabPayload> {
  const force = options?.force ?? false;
  const existing = tabCaches.get(tab);

  if (!force && existing && existing.fetchedAt > 0 && !shouldRefreshProfileTab(tab)) {
    return existing.data;
  }

  if (!force && existing?.promise) {
    return existing.promise;
  }

  const promise = fetch(`/api/profile/${tab}`, { credentials: "same-origin" }).then(
    async (res) => {
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to load profile");
      }
      return res.json() as Promise<ProfileTabPayload>;
    }
  );

  tabCaches.set(tab, {
    data: existing?.data ?? ({} as ProfileTabPayload),
    fetchedAt: existing?.fetchedAt ?? 0,
    promise,
  });

  try {
    const data = await promise;
    tabCaches.set(tab, { data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    const current = tabCaches.get(tab);
    if (current?.promise === promise) {
      if (current.fetchedAt > 0) {
        tabCaches.set(tab, { data: current.data, fetchedAt: current.fetchedAt });
      } else {
        tabCaches.delete(tab);
      }
    }
    throw err;
  }
}

/** Fetch in background; never throws to caller. */
export function refreshProfileTabInBackground(tab: ProfileTabSlug): void {
  if (tabCaches.get(tab)?.promise) return;
  void fetchProfileTab(tab, { force: true, background: true }).catch(() => {});
}

export function prefetchProfileTab(tab: ProfileTabSlug): void {
  if (!shouldRefreshProfileTab(tab) || tabCaches.get(tab)?.promise) return;
  void fetchProfileTab(tab).catch(() => {});
}

export function prefetchProfileOverview(): void {
  prefetchProfileTab("overview");
}
