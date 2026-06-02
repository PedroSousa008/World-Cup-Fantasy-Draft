import { OwnerGroupStagePanel } from "@/components/owner/owner-group-stage-panel";
import { getGroupTablesData } from "@/lib/tournament/get-tournament-data";

export const dynamic = "force-dynamic";

export default async function OwnerEventsGroupStagePage() {
  const { tables, bestThird, overrides } = await getGroupTablesData();

  return (
    <OwnerGroupStagePanel
      tables={tables}
      bestThird={bestThird}
      overrides={overrides.map((o) => ({
        nationalTeamId: o.nationalTeamId,
        played: o.played,
        won: o.won,
        drawn: o.drawn,
        lost: o.lost,
        goalsFor: o.goalsFor,
        goalsAgainst: o.goalsAgainst,
        points: o.points,
      }))}
    />
  );
}
