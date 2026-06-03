"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProfileTabPayload, ProfileTabSlug } from "@/lib/profile/types";
import {
  fetchProfileTab,
  getCachedProfileTabForDisplay,
  shouldRefreshProfileTab,
} from "@/lib/profile/profile-cache";

const POLL_MS = 12_000;

export function useProfileTab<T extends ProfileTabPayload>(tab: ProfileTabSlug) {
  const cached = getCachedProfileTabForDisplay(tab) as T | null;
  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState(() => !cached);
  const mountedRef = useRef(true);

  const applyData = useCallback((next: T) => {
    if (mountedRef.current) {
      setData(next);
      setLoading(false);
    }
  }, []);

  const sync = useCallback(
    async (force = false) => {
      const display = getCachedProfileTabForDisplay(tab) as T | null;
      if (display && !force) {
        applyData(display);
      }

      if (!force && display && !shouldRefreshProfileTab(tab)) {
        return;
      }

      if (!display) {
        setLoading(true);
      }

      try {
        const next = (await fetchProfileTab(tab, { force })) as T;
        applyData(next);
      } catch {
        if (mountedRef.current) setLoading(false);
      }
    },
    [tab, applyData]
  );

  useEffect(() => {
    mountedRef.current = true;

    const display = getCachedProfileTabForDisplay(tab) as T | null;
    if (display) {
      setData(display);
      setLoading(false);
      if (shouldRefreshProfileTab(tab)) {
        void fetchProfileTab(tab, { force: true })
          .then((next) => applyData(next as T))
          .catch(() => {});
      }
    } else {
      void sync(true);
    }

    const pollId = window.setInterval(() => {
      void fetchProfileTab(tab, { force: true })
        .then((next) => applyData(next as T))
        .catch(() => {});
    }, POLL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(pollId);
    };
  }, [tab, sync, applyData]);

  const refresh = useCallback(() => {
    void sync(true);
  }, [sync]);

  return { data, loading, refresh };
}
