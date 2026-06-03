"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProfileTabPayload, ProfileTabSlug } from "@/lib/profile/types";
import {
  fetchProfileTab,
  getCachedProfileTab,
  seedProfileTabCache,
} from "@/lib/profile/profile-cache";

const POLL_MS = 12_000;

export function useProfileTab<T extends ProfileTabPayload>(
  tab: ProfileTabSlug,
  initialData: T
) {
  const cached = getCachedProfileTab(tab) as T | null;
  const [data, setData] = useState<T>(() => cached ?? initialData);
  const [loading, setLoading] = useState(() => !cached);

  useEffect(() => {
    seedProfileTabCache(tab, initialData);
  }, [tab, initialData]);

  const sync = useCallback(
    async (force = false) => {
      try {
        const next = (await fetchProfileTab(tab, { force })) as T;
        setData(next);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    const cachedNow = getCachedProfileTab(tab) as T | null;
    if (cachedNow) {
      setData(cachedNow);
      setLoading(false);
    }

    void sync(!cachedNow);
    const id = window.setInterval(() => void sync(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [tab, sync]);

  const refresh = useCallback(() => {
    void sync(true);
  }, [sync]);

  return { data, loading, refresh };
}
