import { Gavel } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/bets/active", label: "Bets" },
  { href: "/bets/punishments", label: "Punishments" },
];

export default function PunishmentsPage() {
  return (
    <>
      <PageHeader
        title="Rewards & Punishments"
        description="League rewards, punishments, and completion tracking"
      />
      <SubNav items={subNavItems} activeHref="/bets/punishments" />
      <Card>
        <EmptyState
          icon={<Gavel className="h-12 w-12" />}
          title="No rewards or punishments yet"
          description="The Owner will assign rewards and punishments based on league rankings."
        />
      </Card>
    </>
  );
}
