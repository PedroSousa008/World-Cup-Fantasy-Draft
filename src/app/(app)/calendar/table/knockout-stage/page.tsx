import { KnockoutBracketClient } from "@/components/tournament/knockout-bracket-client";

export default function CalendarTableKnockoutPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/55">
        Knockout bracket — view only. Owner manages teams and results.
      </p>
      <KnockoutBracketClient editable={false} />
    </div>
  );
}
