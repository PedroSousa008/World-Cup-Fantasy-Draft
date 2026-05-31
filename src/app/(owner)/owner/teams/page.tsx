import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Flag } from "lucide-react";

export default function OwnerTeamsPage() {
  return (
    <>
      <PageHeader
        title="National Teams"
        description="Manage teams, flags, groups, and player assignments"
      />
      <Card>
        <EmptyState
          icon={<Flag className="h-12 w-12" />}
          title="No national teams yet"
          description="Create teams, assign groups, and mark qualification/elimination status."
        />
      </Card>
    </>
  );
}
