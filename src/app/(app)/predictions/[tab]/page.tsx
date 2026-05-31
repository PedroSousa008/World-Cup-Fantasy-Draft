import { notFound } from "next/navigation";
import { SubTabs } from "@/components/layout/sub-tabs";
import { SectionPage } from "@/components/layout/section-page";
import { PREDICTIONS_TABS } from "@/lib/navigation";

const TAB_CONTENT: Record<
  string,
  { title: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  tournament: {
    title: "Tournament Predictions",
    description: "Predict the World Cup winner, Golden Boot, and more.",
    emptyTitle: "No tournament predictions yet",
    emptyDescription:
      "Submit your tournament predictions before the deadline set by the Owner.",
  },
  matches: {
    title: "Match Predictions",
    description: "Predict match winners, scores, and first goalscorers.",
    emptyTitle: "No match predictions yet",
    emptyDescription:
      "Match predictions will be available once the Owner publishes the schedule.",
  },
  ranking: {
    title: "Prediction Ranking",
    description: "See who has the best prediction accuracy.",
    emptyTitle: "Prediction rankings empty",
    emptyDescription:
      "Rankings will update automatically as predictions are scored.",
  },
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function PredictionsTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = PREDICTIONS_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const content = TAB_CONTENT[tab];

  return (
    <div className="space-y-6">
      <SubTabs tabs={PREDICTIONS_TABS} activeTab={tab} basePath="/predictions" accent="blue" />
      <SectionPage {...content} accent="blue" />
    </div>
  );
}
