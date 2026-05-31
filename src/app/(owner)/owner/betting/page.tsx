import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Coins } from "lucide-react";

export default function OwnerBettingPage() {
  return (
    <>
      <PageHeader
        title="Betting"
        description="Enable betting, select matches, and create announcements"
      />
      <Card>
        <EmptyState
          icon={<Coins className="h-12 w-12" />}
          title="Betting disabled"
          description="Enable betting, select available matches, and create promoted bets."
        />
      </Card>
    </>
  );
}
