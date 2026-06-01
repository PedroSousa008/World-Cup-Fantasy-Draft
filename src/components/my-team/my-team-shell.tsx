"use client";

import { SwipeableTabBar } from "@/components/my-team/swipeable-tab-bar";
import { TeamView } from "@/components/my-team/team/team-view";
import { RankingsView } from "@/components/my-team/rankings/rankings-view";
import { DraftRoomView } from "@/components/my-team/draft/draft-room-view";
import { PowersView } from "@/components/my-team/powers/powers-view";
import type { RankingsData } from "@/lib/rankings/types";

interface MyTeamShellProps {
  activeTab: string;
  user: {
    teamName: string;
    selectedNation: string;
    username: string;
  };
  rankingsData?: RankingsData;
}

export function MyTeamShell({ activeTab, user, rankingsData }: MyTeamShellProps) {
  return (
    <div className="mx-auto w-full max-w-lg overflow-x-hidden">
      {/* Sub-tabs: in document flow, directly under header — never overlaps content */}
      <div className="shrink-0 border-b border-white/6 bg-[#081120]/95 pb-2 pt-1">
        <SwipeableTabBar activeTab={activeTab} />
      </div>

      <div className="animate-wc-flow-in overflow-x-hidden pt-3">
        {activeTab === "team" && (
          <TeamView teamName={user.teamName} selectedNation={user.selectedNation} />
        )}
        {activeTab === "rankings" && rankingsData && (
          <RankingsView data={rankingsData} />
        )}
        {activeTab === "draft" && <DraftRoomView />}
        {activeTab === "powers" && <PowersView />}
      </div>
    </div>
  );
}
