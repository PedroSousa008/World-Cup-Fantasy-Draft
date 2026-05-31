import { Coins } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/bets/active", label: "Bets" },
  { href: "/bets/punishments", label: "Punishments" },
];

export default function ActiveBetsPage() {
  return (
    <>
      <PageHeader
        title="Bets"
        description="Create, accept, and track bets with your rivals"
      />
      <SubNav items={subNavItems} activeHref="/bets/active" />
      <Card>
        <EmptyState
          icon={<Coins className="h-12 w-12" />}
          title="No active bets"
          description="Challenge your friends with match bets, player bets, fantasy bets, or custom wagers."
        />
      </Card>
    </>
  );
}
