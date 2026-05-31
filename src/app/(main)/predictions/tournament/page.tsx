import { Globe } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/predictions/tournament", label: "Tournament Predictions" },
  { href: "/predictions/matches", label: "Match Predictions" },
  { href: "/predictions/ranking", label: "Prediction Ranking" },
];

export default function TournamentPredictionsPage() {
  return (
    <>
      <PageHeader
        title="Tournament Predictions"
        description="World Cup winner, Golden Boot, Golden Ball, and more"
      />
      <SubNav items={subNavItems} activeHref="/predictions/tournament" />
      <Card>
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No tournament predictions yet"
          description="Make your long-term predictions before the tournament kicks off."
        />
      </Card>
    </>
  );
}
