import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/section-page";
import { CALENDAR_TABS } from "@/lib/navigation";
import { CalendarMainTabs } from "@/components/tournament/calendar-main-tabs";
import { CalendarMatchesLoader } from "@/components/tournament/calendar-matches-loader";
import { GamesMatchesLoader } from "@/components/tournament/games-matches-loader";
import { CalendarMatchesSkeleton } from "@/components/tournament/calendar-matches-skeleton";

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
    return (
      <div className="space-y-6">
        <CalendarMainTabs activeTab={tab} />
        <PageHeader title={meta.title} description={meta.description} />
        <Suspense fallback={<CalendarMatchesSkeleton />}>
          <CalendarMatchesLoader />
        </Suspense>
      </div>
    );
  }

  if (tab === "games") {
    return (
      <div className="space-y-6">
        <CalendarMainTabs activeTab={tab} />
        <PageHeader title={meta.title} description={meta.description} />
        <Suspense fallback={<CalendarMatchesSkeleton />}>
          <GamesMatchesLoader />
        </Suspense>
      </div>
    );
  }

  notFound();
}
