import { Zap } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/my-team/team", label: "Team" },
  { href: "/my-team/rankings", label: "Ranking Tables" },
  { href: "/my-team/draft", label: "Draft Room" },
  { href: "/my-team/powers", label: "Powers" },
];

export default function PowersPage() {
  return (
    <>
      <PageHeader
        title="Powers"
        description="Double Points, Triple Captain, Wildcard, and more"
      />
      <SubNav items={subNavItems} activeHref="/my-team/powers" />
      <Card>
        <EmptyState
          icon={<Zap className="h-12 w-12" />}
          title="No powers available"
          description="Power cards will be unlocked as the competition progresses."
        />
      </Card>
    </>
  );
}
