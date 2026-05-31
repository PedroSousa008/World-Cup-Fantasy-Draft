import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Calculator } from "lucide-react";

export default function OwnerScoringPage() {
  return (
    <>
      <PageHeader
        title="Scoring System"
        description="Customize fantasy point values for all events"
      />
      <Card>
        <EmptyState
          icon={<Calculator className="h-12 w-12" />}
          title="Default scoring rules"
          description="Configure goal points, assist points, clean sheets, card deductions, and more."
        />
      </Card>
    </>
  );
}
