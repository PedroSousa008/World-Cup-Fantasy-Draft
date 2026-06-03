import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { PREDICTIONS_TABS } from "@/lib/navigation";
import { GroupStagePredictionsClient } from "@/components/predictions/group-stage-predictions-client";
import { MatchPredictionsClient } from "@/components/predictions/match-predictions-client";
import { getTournamentPredictionsData } from "@/lib/predictions/get-tournament-predictions-data";
import { getMatchesByMatchday } from "@/lib/tournament/get-tournament-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function PredictionsTabPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await params;
  const validTab = PREDICTIONS_TABS.find((t) => t.slug === tab);
  if (!validTab) redirect(`/predictions/${PREDICTIONS_TABS[0]!.slug}`);

  if (tab === "tournament") {
    const data = await getTournamentPredictionsData(session.user.id);

    return (
      <div className="space-y-6 overflow-x-hidden">
        <SubTabs tabs={PREDICTIONS_TABS} activeTab={tab} basePath="/predictions" accent="blue" />
        <PageHeader
          title="Tournament Predictions"
          description="Predict every group ranking, then pick knockout winners once the Group Stage ends."
        />
        <GroupStagePredictionsClient
          groups={data.groups}
          completedGroupCount={data.completedGroupCount}
          allGroupsComplete={data.allGroupsComplete}
          knockoutUnlocked={data.knockoutUnlocked}
        />
      </div>
    );
  }

  if (tab === "matches") {
    const matchdayGroups = await getMatchesByMatchday();

    return (
      <div className="space-y-6 overflow-x-hidden">
        <SubTabs tabs={PREDICTIONS_TABS} activeTab={tab} basePath="/predictions" accent="blue" />
        <PageHeader
          title="Match Predictions"
          description="Predict individual match outcomes — scoring coming later."
        />
        <MatchPredictionsClient matchdayGroups={matchdayGroups} />
      </div>
    );
  }

  redirect(`/predictions/${PREDICTIONS_TABS[0]!.slug}`);
}
