"use client";

import { useEffect } from "react";
import { DraftRoomView } from "@/components/my-team/draft/draft-room-view";
import { DraftSkeleton } from "@/components/my-team/draft/draft-skeleton";
import { useMyTeamTabs } from "@/contexts/my-team-tabs-context";
import { useDraftData } from "@/contexts/draft-data-context";
import { isDraftCacheStale } from "@/lib/draft/draft-cache";

export function DraftTab() {
  const { activeTab } = useMyTeamTabs();
  const { state, refresh } = useDraftData();

  useEffect(() => {
    if (activeTab === "draft" && isDraftCacheStale()) {
      void refresh();
    }
  }, [activeTab, refresh]);

  if (state.status === "ready") {
    return <DraftRoomView data={state.data} />;
  }

  if (state.status === "loading" && state.data) {
    return <DraftRoomView data={state.data} />;
  }

  if (state.status === "error") {
    return (
      <div className="space-y-4 px-4 pb-6">
        <div>
          <h2 className="text-display text-xl">Draft</h2>
          <p className="mt-2 rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">
            {state.message}
          </p>
        </div>
        {state.data ? <DraftRoomView data={state.data} /> : <DraftSkeleton />}
      </div>
    );
  }

  return <DraftSkeleton />;
}
