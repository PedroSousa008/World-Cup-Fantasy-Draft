import { Shuffle } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/my-team/team", label: "Team" },
  { href: "/my-team/rankings", label: "Ranking Tables" },
  { href: "/my-team/draft", label: "Draft Room" },
  { href: "/my-team/powers", label: "Powers" },
];

export default function DraftPage() {
  return (
    <>
      <PageHeader
        title="Draft Room"
        description="Initial draft, redrafts, and available players"
      />
      <SubNav items={subNavItems} activeHref="/my-team/draft" />
      <Card>
        <EmptyState
          icon={<Shuffle className="h-12 w-12" />}
          title="Draft not started"
          description="The Owner will schedule draft events. Draft mechanics coming in a future phase."
        />
      </Card>
    </>
  );
}
