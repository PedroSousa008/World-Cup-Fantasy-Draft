import { CalendarMatchesSkeleton } from "@/components/tournament/calendar-matches-skeleton";
import { PageHeader } from "@/components/layout/section-page";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-white/10" />
      <PageHeader title="Calendar" description="Loading tournament schedule…" />
      <CalendarMatchesSkeleton />
    </div>
  );
}
