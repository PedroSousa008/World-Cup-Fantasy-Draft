import { BarChart3 } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/predictions/tournament", label: "Tournament Predictions" },
  { href: "/predictions/matches", label: "Match Predictions" },
  { href: "/predictions/ranking", label: "Prediction Ranking" },
];

export default function PredictionRankingPage() {
  return (
    <>
      <PageHeader
        title="Prediction Ranking"
        description="See who's the best predictor in the league"
      />
      <SubNav items={subNavItems} activeHref="/predictions/ranking" />
      <Card>
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No prediction rankings yet"
          description="Rankings will update as predictions are scored."
        />
      </Card>
    </>
  );
}
