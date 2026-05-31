import { notFound } from "next/navigation";
import { SubTabs } from "@/components/layout/sub-tabs";
import { SectionPage } from "@/components/layout/section-page";
import { BETS_TABS } from "@/lib/navigation";

const TAB_CONTENT: Record<
  string,
  { title: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  bets: {
    title: "Bets",
    description: "Create, accept, and track bets with your rivals.",
    emptyTitle: "No active bets",
    emptyDescription:
      "Challenge your friends with match bets, player bets, or custom stakes.",
  },
  punishments: {
    title: "Punishments & Rewards",
    description: "Track rewards, punishments, and completion status.",
    emptyTitle: "No punishments assigned",
    emptyDescription:
      "Rewards and punishments will be assigned by ranking position by the Owner.",
  },
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function BetsTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = BETS_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const content = TAB_CONTENT[tab];

  return (
    <div className="space-y-6">
      <SubTabs tabs={BETS_TABS} activeTab={tab} basePath="/bets" />
      <SectionPage {...content} />
    </div>
  );
}
