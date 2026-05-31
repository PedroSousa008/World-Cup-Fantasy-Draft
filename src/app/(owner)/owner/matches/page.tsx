import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Swords } from "lucide-react";

export default function OwnerMatchesPage() {
  return (
    <>
      <PageHeader
        title="Matches"
        description="Create matches and enter scores, events, and Man of the Match"
      />
      <Card>
        <EmptyState
          icon={<Swords className="h-12 w-12" />}
          title="No matches yet"
          description="Create matches and enter goals, assists, cards, penalties, and more."
        />
      </Card>
    </>
  );
}
