import { Trophy } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/my-team/team", label: "Team" },
  { href: "/my-team/rankings", label: "Ranking Tables" },
  { href: "/my-team/draft", label: "Draft Room" },
  { href: "/my-team/powers", label: "Powers" },
];

export default function RankingsPage() {
  return (
    <>
      <PageHeader
        title="Ranking Tables"
        description="Overall, matchday, bet, and prediction standings"
      />
      <SubNav items={subNavItems} activeHref="/my-team/rankings" />
      <Card>
        <EmptyState
          icon={<Trophy className="h-12 w-12" />}
          title="No rankings yet"
          description="Rankings will appear once matches are played and points are calculated."
        />
      </Card>
    </>
  );
}
