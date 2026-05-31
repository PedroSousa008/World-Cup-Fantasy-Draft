import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Users } from "lucide-react";

export default function OwnerPlayersPage() {
  return (
    <>
      <PageHeader
        title="Players"
        description="Create, edit, and delete player cards"
      />
      <Card>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No players yet"
          description="Add players with name, photo, position, nationality, club, and availability status."
        />
      </Card>
    </>
  );
}
