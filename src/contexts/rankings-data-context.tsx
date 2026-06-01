"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchRankingsData,
  getCachedRankings,
  invalidateRankingsCache,
  prefetchRankingsData,
} from "@/lib/rankings/rankings-cache";
import type { RankingsData } from "@/lib/rankings/types";

type RankingsState =
  | { status: "idle" }
  | { status: "loading"; data?: RankingsData }
  | { status: "ready"; data: RankingsData }
  | { status: "error"; message: string; data?: RankingsData };

interface RankingsDataContextValue {
  state: RankingsState;
  refresh: () => Promise<void>;
}

const RankingsDataContext = createContext<RankingsDataContextValue | null>(null);

export function RankingsDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RankingsState>(() => {
    const cached = getCachedRankings();
    return cached ? { status: "ready", data: cached } : { status: "idle" };
  });

  const load = useCallback(async (force = false) => {
    const cached = !force ? getCachedRankings() : null;
    if (cached) {
      setState({ status: "ready", data: cached });
      return;
    }

    setState((prev) =>
      prev.status === "ready"
        ? { status: "loading", data: prev.data }
        : { status: "loading" }
    );

    try {
      const data = await fetchRankingsData({ force });
      setState({ status: "ready", data });
    } catch (err) {
      setState((prev) => ({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load rankings",
        data: prev.status === "ready" ? prev.data : undefined,
      }));
    }
  }, []);

  useEffect(() => {
    prefetchRankingsData();
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    invalidateRankingsCache();
    await load(true);
  }, [load]);

  const value = useMemo(() => ({ state, refresh }), [state, refresh]);

  return (
    <RankingsDataContext.Provider value={value}>{children}</RankingsDataContext.Provider>
  );
}

export function useRankingsData() {
  const ctx = useContext(RankingsDataContext);
  if (!ctx) {
    throw new Error("useRankingsData must be used within RankingsDataProvider");
  }
  return ctx;
}

/** Refresh rankings after power/match changes (no-op outside provider). */
export function useRankingsRefreshOptional() {
  const ctx = useContext(RankingsDataContext);
  return ctx?.refresh ?? null;
}

export { invalidateRankingsCache };
