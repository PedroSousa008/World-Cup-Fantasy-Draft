import { Swords } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/calendar/events", label: "Calendar" },
  { href: "/calendar/games", label: "Games" },
];

export default function GamesPage() {
  return (
    <>
      <PageHeader
        title="Games"
        description="Every World Cup match with scores, goalscorers, and related bets"
      />
      <SubNav items={subNavItems} activeHref="/calendar/games" />
      <Card>
        <EmptyState
          icon={<Swords className="h-12 w-12" />}
          title="No games scheduled"
          description="Match cards will appear once the Owner creates the tournament schedule."
        />
      </Card>
    </>
  );
}
