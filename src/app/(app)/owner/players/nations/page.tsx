import { PageHeader } from "@/components/layout/section-page";
import { OwnerPlayersPanel } from "@/components/owner/owner-players-panel";
import { getOwnerPlayersPageData } from "@/lib/owner/get-nations-data";

export const dynamic = "force-dynamic";

export default async function OwnerPlayersNationsPage() {
  const { nations, error, needsSetup } = await getOwnerPlayersPageData();

  return (
    <>
      <PageHeader
        title="Nations & Players"
        description="Manage nations, upload player images, create players, and assign squads."
      />

      <OwnerPlayersPanel nations={nations} error={error} needsSetup={needsSetup} />
    </>
  );
}
