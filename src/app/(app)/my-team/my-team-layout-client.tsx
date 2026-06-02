"use client";

import { SquadProvider } from "@/contexts/squad-context";
import type { SquadInitialData } from "@/lib/squad/get-squad-data";
import { DraftDataProvider } from "@/contexts/draft-data-context";
import { RankingsDataProvider } from "@/contexts/rankings-data-context";
import { MyTeamTabsProvider } from "@/contexts/my-team-tabs-context";
import { usePathname } from "next/navigation";
import { MY_TEAM_TABS, getDefaultTab } from "@/lib/navigation";

interface MyTeamLayoutClientProps {
  teamName: string;
  squadInitial: SquadInitialData;
  children: React.ReactNode;
}

function initialTabFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop();
  const match = MY_TEAM_TABS.find((t) => t.slug === segment);
  return match?.slug ?? getDefaultTab(MY_TEAM_TABS);
}

export function MyTeamLayoutClient({
  squadInitial,
  children,
}: MyTeamLayoutClientProps) {
  const pathname = usePathname();
  const initialTab = initialTabFromPath(pathname);

  return (
    <SquadProvider
      key={squadInitial.assignedPlayers
        .map((p) => p.id)
        .sort()
        .join(",")}
      initial={squadInitial}
    >
      <RankingsDataProvider>
        <DraftDataProvider>
          <MyTeamTabsProvider initialTab={initialTab}>{children}</MyTeamTabsProvider>
        </DraftDataProvider>
      </RankingsDataProvider>
    </SquadProvider>
  );
}
