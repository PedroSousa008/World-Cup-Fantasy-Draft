import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Gavel } from "lucide-react";

export default function OwnerPunishmentsPage() {
  return (
    <>
      <PageHeader
        title="Rewards & Punishments"
        description="Create and assign by ranking position"
      />
      <Card>
        <EmptyState
          icon={<Gavel className="h-12 w-12" />}
          title="No rewards or punishments"
          description="Create rewards and punishments and assign them by ranking category and position."
        />
      </Card>
    </>
  );
}
