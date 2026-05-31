import { Users } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/my-team/team", label: "Team" },
  { href: "/my-team/rankings", label: "Ranking Tables" },
  { href: "/my-team/draft", label: "Draft Room" },
  { href: "/my-team/powers", label: "Powers" },
];

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="My Team"
        description="Your squad, captain picks, and live points"
      />
      <SubNav items={subNavItems} activeHref="/my-team/team" />
      <Card>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Your squad is empty"
          description="Draft players to build your starting team, bench, and captain picks. Fantasy calculations coming in a future phase."
        />
      </Card>
    </>
  );
}
