import { notFound } from "next/navigation";
import { SubTabs } from "@/components/layout/sub-tabs";
import { SectionPage } from "@/components/layout/section-page";
import { CALENDAR_TABS } from "@/lib/navigation";

const TAB_CONTENT: Record<
  string,
  { title: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  calendar: {
    title: "Calendar",
    description: "Matchdays, drafts, deadlines, and custom league events.",
    emptyTitle: "Calendar is empty",
    emptyDescription:
      "Events will appear here once the Owner adds them to the schedule.",
  },
  games: {
    title: "Games",
    description: "World Cup match cards with scores, events, and related bets.",
    emptyTitle: "No games scheduled",
    emptyDescription:
      "Match cards will appear once the Owner creates the tournament schedule.",
  },
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function CalendarTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = CALENDAR_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const content = TAB_CONTENT[tab];

  return (
    <div className="space-y-6">
      <SubTabs tabs={CALENDAR_TABS} activeTab={tab} basePath="/calendar" accent="green" />
      <SectionPage {...content} accent="blue" />
    </div>
  );
}
