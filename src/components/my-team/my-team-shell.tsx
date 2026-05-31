"use client";

import { SwipeableTabBar } from "@/components/my-team/swipeable-tab-bar";
import { TeamView } from "@/components/my-team/team/team-view";
import { RankingsView } from "@/components/my-team/rankings/rankings-view";
import { DraftRoomView } from "@/components/my-team/draft/draft-room-view";
import { PowersView } from "@/components/my-team/powers/powers-view";

interface MyTeamShellProps {
  activeTab: string;
  user: {
    teamName: string;
    selectedNation: string;
    username: string;
  };
}

export function MyTeamShell({ activeTab, user }: MyTeamShellProps) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="sticky top-14 z-30 -mx-4 bg-[#081120]/80 pb-3 pt-1 backdrop-blur-md sm:mx-0 sm:rounded-2xl">
        <SwipeableTabBar activeTab={activeTab} />
      </div>

      <div className="animate-wc-flow-in min-h-[60dvh]">
        {activeTab === "team" && (
          <TeamView teamName={user.teamName} selectedNation={user.selectedNation} />
        )}
        {activeTab === "rankings" && <RankingsView />}
        {activeTab === "draft" && <DraftRoomView />}
        {activeTab === "powers" && <PowersView />}
      </div>
    </div>
  );
}
