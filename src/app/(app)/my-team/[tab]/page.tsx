import { notFound } from "next/navigation";
import { SubTabs } from "@/components/layout/sub-tabs";
import { SectionPage } from "@/components/layout/section-page";
import { MY_TEAM_TABS } from "@/lib/navigation";

const TAB_CONTENT: Record<
  string,
  { title: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  team: {
    title: "My Team",
    description: "Manage your starting lineup, bench, captain, and live points.",
    emptyTitle: "Your squad is empty",
    emptyDescription:
      "Draft players to build your starting team, bench, and captain picks. Coming in Phase 2.",
  },
  rankings: {
    title: "Ranking Tables",
    description: "Overall, matchday, bet, and prediction rankings.",
    emptyTitle: "No rankings yet",
    emptyDescription:
      "Rankings will appear once matches are played and points are calculated.",
  },
  draft: {
    title: "Draft Room",
    description: "Initial draft, knockout redraft, and draft history.",
    emptyTitle: "Draft not started",
    emptyDescription:
      "The draft room will open when the Owner schedules a draft event.",
  },
  powers: {
    title: "Powers",
    description: "Double Points, Triple Captain, Wildcard, and more.",
    emptyTitle: "No powers available",
    emptyDescription:
      "Special power cards will be unlocked during the tournament.",
  },
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function MyTeamTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = MY_TEAM_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const content = TAB_CONTENT[tab];

  return (
    <div className="space-y-6">
      <SubTabs tabs={MY_TEAM_TABS} activeTab={tab} basePath="/my-team" accent="green" />
      <SectionPage {...content} accent="green" />
    </div>
  );
}
