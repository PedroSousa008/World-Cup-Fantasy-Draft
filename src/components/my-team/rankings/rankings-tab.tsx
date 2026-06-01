"use client";

import { useEffect } from "react";
import { RankingsView } from "@/components/my-team/rankings/rankings-view";
import { RankingsSkeleton } from "@/components/my-team/rankings/rankings-skeleton";
import { useMyTeamTabs } from "@/contexts/my-team-tabs-context";
import { useRankingsData } from "@/contexts/rankings-data-context";
import { isRankingsCacheStale } from "@/lib/rankings/rankings-cache";

export function RankingsTab() {
  const { activeTab } = useMyTeamTabs();
  const { state, refresh } = useRankingsData();

  useEffect(() => {
    if (activeTab === "rankings" && isRankingsCacheStale()) {
      void refresh();
    }
  }, [activeTab, refresh]);

  if (state.status === "ready") {
    return <RankingsView data={state.data} />;
  }

  if (state.status === "loading" && state.data) {
    return <RankingsView data={state.data} />;
  }

  if (state.status === "error") {
    return (
      <div className="space-y-4 px-4 pb-4">
        <div>
          <h2 className="text-display text-xl">Rankings</h2>
          <p className="mt-2 rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">
            {state.message}
          </p>
        </div>
        {state.data ? <RankingsView data={state.data} /> : <RankingsSkeleton />}
      </div>
    );
  }

  return <RankingsSkeleton />;
}
