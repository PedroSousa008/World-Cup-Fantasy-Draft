import { OwnerMatchesPanel } from "@/components/owner/owner-matches-panel";
import { getOwnerMatchesPageData } from "@/lib/owner/get-matches-data";

export const dynamic = "force-dynamic";

export default async function OwnerMatchesEventsMatchesPage() {
  const { matches } = await getOwnerMatchesPageData();

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/55">
        Enter scores, goalscorers, assists, cards, penalties, and MVP. Fantasy points recalculate
        from these events automatically.
      </p>
      <OwnerMatchesPanel matches={matches} basePath="/owner/matches-events/matches" />
    </div>
  );
}
