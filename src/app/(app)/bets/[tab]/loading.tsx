import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { PunishmentsRewardsSkeleton } from "@/components/bets/punishments-rewards-skeleton";
import { BETS_TABS } from "@/lib/navigation";

export default function BetsTabLoading() {
  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <PageHeader
        title="Bets & Punishments"
        description="Vote on owner-promoted matches and view ranking rewards."
      />

      <SubTabs tabs={BETS_TABS} basePath="/bets" accent="red" />

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        <PunishmentsRewardsSkeleton />
      </div>
    </div>
  );
}
