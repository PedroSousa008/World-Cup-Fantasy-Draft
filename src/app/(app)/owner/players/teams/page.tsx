import { PageHeader } from "@/components/layout/section-page";
import { OwnerTeamsPanel } from "@/components/owner/owner-teams-panel";
import { getOwnerTeamsPageData } from "@/lib/owner/get-teams-data";

export const dynamic = "force-dynamic";

export default async function OwnerPlayersTeamsPage() {
  const { teams, pickerPlayers } = await getOwnerTeamsPageData();

  return (
    <>
      <PageHeader
        title="Teams"
        description="Assign each user's full 18-player squad by position."
      />

      <OwnerTeamsPanel teams={teams} pickerPlayers={pickerPlayers} />
    </>
  );
}
