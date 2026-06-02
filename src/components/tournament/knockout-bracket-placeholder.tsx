import { EmptyState } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function KnockoutBracketPlaceholder() {
  return (
    <div className="space-y-6">
      <EmptyState
        title="Knockout bracket"
        description="The bracket will connect to Owner knockout management once knockout matches are configured."
        accent="green"
      />
      <div className="grid gap-4 opacity-40 sm:grid-cols-2 lg:grid-cols-4">
        {["Last 16", "Quarter Finals", "Semi Finals", "Final"].map((stage) => (
          <div
            key={stage}
            className="rounded-2xl border border-dashed border-white/20 p-6 text-center"
          >
            <Trophy className="mx-auto mb-2 h-8 w-8 text-[#FFD700]/60" />
            <p className="text-sm font-bold text-white">{stage}</p>
            <p className="mt-1 text-xs text-white/45">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
