import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/section-page";
import { CALENDAR_TABS } from "@/lib/navigation";
import { CalendarMainTabs } from "@/components/tournament/calendar-main-tabs";
import { CalendarView } from "@/components/tournament/calendar-view";
import { GamesView } from "@/components/tournament/games-view";
import {
  getAllTournamentMatches,
  getMatchesByMatchday,
} from "@/lib/tournament/get-tournament-data";

export const dynamic = "force-dynamic";

const TAB_META: Record<string, { title: string; description: string }> = {
  calendar: {
    title: "Calendar",
    description: "Monthly, weekly, and daily views of every World Cup match.",
  },
  games: {
    title: "Games",
    description: "All matches grouped by matchday. Tap a match for details.",
  },
  table: {
    title: "Table",
    description: "Live group standings and third-place qualification ranking.",
  },
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function CalendarTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = CALENDAR_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const meta = TAB_META[tab];

  if (tab === "table") {
    redirect("/calendar/table/group-stage");
  }

  if (tab === "calendar") {
    const matches = await getAllTournamentMatches();
    return (
      <div className="space-y-6">
        <CalendarMainTabs activeTab={tab} />
        <PageHeader title={meta.title} description={meta.description} />
        <CalendarView matches={matches} />
      </div>
    );
  }

  if (tab === "games") {
    const matchdayGroups = await getMatchesByMatchday();
    return (
      <div className="space-y-6">
        <CalendarMainTabs activeTab={tab} />
        <PageHeader title={meta.title} description={meta.description} />
        <GamesView matchdayGroups={matchdayGroups} />
      </div>
    );
  }

  notFound();
}
