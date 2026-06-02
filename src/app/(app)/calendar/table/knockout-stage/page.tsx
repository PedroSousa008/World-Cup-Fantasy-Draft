import { KnockoutBracketView } from "@/components/tournament/knockout-bracket-view";
import { getKnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";

export const dynamic = "force-dynamic";

export default async function CalendarTableKnockoutPage() {
  const data = await getKnockoutBracketData();

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/55">Knockout bracket — view only. Owner manages teams and results.</p>
      <KnockoutBracketView data={data} editable={false} />
    </div>
  );
}
