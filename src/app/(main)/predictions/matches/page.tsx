import { Target } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/predictions/tournament", label: "Tournament Predictions" },
  { href: "/predictions/matches", label: "Match Predictions" },
  { href: "/predictions/ranking", label: "Prediction Ranking" },
];

export default function MatchPredictionsPage() {
  return (
    <>
      <PageHeader
        title="Match Predictions"
        description="Predict match winners, scores, and first goalscorers"
      />
      <SubNav items={subNavItems} activeHref="/predictions/matches" />
      <Card>
        <EmptyState
          icon={<Target className="h-12 w-12" />}
          title="No match predictions yet"
          description="Match predictions will be available once the Owner creates the match schedule."
        />
      </Card>
    </>
  );
}
