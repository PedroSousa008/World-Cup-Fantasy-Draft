import { KnockoutBracketView } from "@/components/tournament/knockout-bracket-view";
import { getOwnerKnockoutBracketData } from "@/lib/actions/owner/knockout-bracket";
import { recomputeKnockoutBracket } from "@/lib/tournament/knockout/bracket-service";

export const dynamic = "force-dynamic";

export default async function OwnerEventsKnockoutPage() {
  await recomputeKnockoutBracket();
  const data = await getOwnerKnockoutBracketData();

  return <KnockoutBracketView data={data} editable />;
}
