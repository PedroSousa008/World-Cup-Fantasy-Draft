import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyTeamShell } from "@/components/my-team/my-team-shell";
import { getDefaultTab, MY_TEAM_TABS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ tab?: string[] }>;
}

export default async function MyTeamTabPage({ params }: PageProps) {
  const { tab: segments } = await params;
  const slug = segments?.[0] ?? getDefaultTab(MY_TEAM_TABS);
  const validTab = MY_TEAM_TABS.find((t) => t.slug === slug);
  if (!validTab) notFound();

  const session = await auth();
  const user = session!.user;

  return (
    <MyTeamShell
      user={{
        teamName: user.teamName,
        selectedNation: user.selectedNation,
        username: user.username,
      }}
    />
  );
}
