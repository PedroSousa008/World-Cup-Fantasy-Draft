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
  fetchDraftData,
  getCachedDraft,
  invalidateDraftCache,
  prefetchDraftData,
  updateCachedDraftSavedIds,
} from "@/lib/draft/draft-cache";
import type { DraftData } from "@/lib/draft/types";

type DraftState =
  | { status: "idle" }
  | { status: "loading"; data?: DraftData }
  | { status: "ready"; data: DraftData }
  | { status: "error"; message: string; data?: DraftData };

interface DraftDataContextValue {
  state: DraftState;
  refresh: () => Promise<void>;
  patchSavedIds: (savedPlayerIds: string[]) => void;
}

const DraftDataContext = createContext<DraftDataContextValue | null>(null);

export function DraftDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DraftState>(() => {
    const cached = getCachedDraft();
    return cached ? { status: "ready", data: cached } : { status: "idle" };
  });

  const load = useCallback(async (force = false) => {
    const cached = !force ? getCachedDraft() : null;
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
      const data = await fetchDraftData({ force });
      setState({ status: "ready", data });
    } catch (err) {
      setState((prev) => ({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load draft",
        data: prev.status === "ready" ? prev.data : undefined,
      }));
    }
  }, []);

  useEffect(() => {
    prefetchDraftData();
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    invalidateDraftCache();
    await load(true);
  }, [load]);

  const patchSavedIds = useCallback((savedPlayerIds: string[]) => {
    updateCachedDraftSavedIds(savedPlayerIds);
    setState((prev) => {
      if (prev.status !== "ready") return prev;
      return {
        status: "ready",
        data: { ...prev.data, savedPlayerIds },
      };
    });
  }, []);

  const value = useMemo(
    () => ({ state, refresh, patchSavedIds }),
    [state, refresh, patchSavedIds]
  );

  return (
    <DraftDataContext.Provider value={value}>{children}</DraftDataContext.Provider>
  );
}

export function useDraftData() {
  const ctx = useContext(DraftDataContext);
  if (!ctx) {
    throw new Error("useDraftData must be used within DraftDataProvider");
  }
  return ctx;
}

export function useDraftRefreshOptional() {
  return useContext(DraftDataContext)?.refresh ?? null;
}

export { invalidateDraftCache };
