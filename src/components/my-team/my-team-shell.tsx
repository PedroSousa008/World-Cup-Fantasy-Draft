"use client";

import { SwipeableTabBar } from "@/components/my-team/swipeable-tab-bar";
import { TeamView } from "@/components/my-team/team/team-view";
import { RankingsTab } from "@/components/my-team/rankings/rankings-tab";
import { DraftTab } from "@/components/my-team/draft/draft-tab";
import { PowersView } from "@/components/my-team/powers/powers-view";
import { TabLoadingPlaceholder } from "@/components/my-team/tab-loading-placeholder";
import { useMyTeamTabs } from "@/contexts/my-team-tabs-context";
import { useLazyTabResource } from "@/hooks/use-lazy-tab-resource";
import type { PowersPageData } from "@/lib/powers/types";

interface MyTeamShellProps {
  user: {
    teamName: string;
    selectedNation: string;
    username: string;
  };
}

export function MyTeamShell({ user }: MyTeamShellProps) {
  const { activeTab, setActiveTab } = useMyTeamTabs();

  const powers = useLazyTabResource<PowersPageData>(
    "/api/my-team/powers",
    activeTab === "powers"
  );

  return (
    <div className="mx-auto w-full max-w-lg overflow-x-hidden">
      <div className="shrink-0 border-b border-white/6 bg-[#081120]/95 pb-2 pt-1">
        <SwipeableTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="overflow-x-hidden pt-3">
        {activeTab === "team" && (
          <TeamView teamName={user.teamName} selectedNation={user.selectedNation} />
        )}
        {activeTab === "rankings" && <RankingsTab />}
        {activeTab === "draft" && <DraftTab />}
        {activeTab === "powers" &&
          (powers.data ? (
            <PowersView data={powers.data} />
          ) : (
            <TabLoadingPlaceholder label="powers" />
          ))}
      </div>
    </div>
  );
}
