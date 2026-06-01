import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyTeamShell } from "@/components/my-team/my-team-shell";
import { MY_TEAM_TABS } from "@/lib/navigation";
import { getRankingsData } from "@/lib/rankings/get-rankings-data";
import { getDraftData } from "@/lib/draft/get-draft-data";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function MyTeamTabPage({ params }: PageProps) {
  const { tab } = await params;
  const validTab = MY_TEAM_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const session = await auth();
  const user = session!.user;

  const rankingsData =
    tab === "rankings" ? await getRankingsData(user.teamName) : undefined;

  const draftData = tab === "draft" ? await getDraftData(user.id) : undefined;

  return (
    <MyTeamShell
      activeTab={tab}
      user={{
        teamName: user.teamName,
        selectedNation: user.selectedNation,
        username: user.username,
      }}
      rankingsData={rankingsData}
      draftData={draftData}
    />
  );
}
