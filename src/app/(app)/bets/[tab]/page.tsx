import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/auth/permissions";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { MatchBetsView } from "@/components/bets/match-bets-view";
import { PunishmentsRewardsView } from "@/components/bets/punishments-rewards-view";
import { getMatchBetsData } from "@/lib/bets/get-match-bets-data";
import { getPunishmentsRewardsData } from "@/lib/bets/get-punishments-rewards-data";
import { BETS_TABS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export const dynamic = "force-dynamic";

export default async function BetsTabPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tab } = await params;
  const validTab = BETS_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const canManage = await isPlatformOwner(session.user.id);

  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <PageHeader
        title="Bets & Punishments"
        description="Vote on owner-promoted matches and view ranking rewards."
      />

      <SubTabs tabs={BETS_TABS} activeTab={tab} basePath="/bets" accent="red" />

      {tab === "bets" ? (
        <BetsTabContent userId={session.user.id} showVoteStats={canManage} />
      ) : (
        <PunishmentsTabContent userId={session.user.id} canEdit={canManage} />
      )}
    </div>
  );
}

async function BetsTabContent({
  userId,
  showVoteStats,
}: {
  userId: string;
  showVoteStats: boolean;
}) {
  const data = await getMatchBetsData(userId, { includeVoteStats: showVoteStats });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-display text-xl">Bets</h2>
        <p className="text-body text-sm">Pick one team per match. Odds are set by the Owner.</p>
      </div>
      <MatchBetsView initial={data} showVoteStats={showVoteStats} />
    </div>
  );
}

async function PunishmentsTabContent({
  userId,
  canEdit,
}: {
  userId: string;
  canEdit: boolean;
}) {
  const data = await getPunishmentsRewardsData(userId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-display text-xl">Punishments & Rewards</h2>
        <p className="text-body text-sm">
          {canEdit
            ? "Manage outcomes by ranking position. Users see updates live."
            : "See what applies at each ranking position. Your current rank is highlighted."}
        </p>
      </div>
      <PunishmentsRewardsView initial={data} canEdit={canEdit} />
    </div>
  );
}
