"use client";

import { useCallback, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import type { KnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";
import { applyWinnerSelection } from "@/lib/tournament/knockout/bracket-client-mutate";
import { saveKnockoutPredictionAction } from "@/lib/actions/predictions/knockout-predictions";
import { KnockoutBracketSkeleton } from "@/components/tournament/knockout-bracket-skeleton";

const KnockoutBracketView = dynamic(
  () =>
    import("@/components/tournament/knockout-bracket-view").then((m) => m.KnockoutBracketView),
  { loading: () => <KnockoutBracketSkeleton />, ssr: false }
);

interface KnockoutPredictionsClientProps {
  initialData: KnockoutBracketData;
  locked: boolean;
  unlocked: boolean;
  isComplete: boolean;
  predictedCount: number;
  totalMatches: number;
}

export function KnockoutPredictionsClient({
  initialData,
  locked,
  unlocked,
  isComplete,
  predictedCount,
  totalMatches,
}: KnockoutPredictionsClientProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [lockedState, setLockedState] = useState(locked);
  const [pending, startTransition] = useTransition();

  const handleSetWinner = useCallback(
    async (matchKey: string, winnerNationalTeamId: string) => {
      if (lockedState || !unlocked) return;

      const optimistic = applyWinnerSelection(data, matchKey, winnerNationalTeamId);
      setData(optimistic);
      setError(null);

      startTransition(() => {
        void (async () => {
          const result = await saveKnockoutPredictionAction({
            matchKey,
            winnerNationalTeamId,
          });

          if (!result.ok) {
            setData(data);
            setError(result.error ?? "Could not save prediction.");
            return;
          }

          if (result.locked) {
            setLockedState(true);
          }
        })();
      });
    },
    [data, lockedState, unlocked]
  );

  if (!unlocked) {
    return (
      <div className="wc-card-dark flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
        <Lock className="h-8 w-8 text-white/30" />
        <p className="text-sm font-semibold text-white">KO Stages locked</p>
        <p className="max-w-sm text-sm text-white/50">
          KO Stages unlock after the Group Stage is complete and the Last 32 bracket is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/8">
        <div>
          <p className="text-sm font-semibold text-white">Your knockout roadmap</p>
          <p className="text-xs text-white/45">
            Tap each match to pick the winner. Winners advance automatically.
          </p>
        </div>
        <p className="text-sm font-bold tabular-nums text-[#0066FF]">
          {predictedCount}/{totalMatches}
        </p>
      </div>

      {lockedState && (
        <div className="flex items-center gap-2 rounded-xl bg-[#00C853]/10 px-4 py-3 ring-1 ring-[#00C853]/20">
          <Lock className="h-4 w-4 text-[#00C853]" />
          <p className="text-sm font-semibold text-[#00C853]">
            Prediction submitted — locked.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]" role="alert">
          {error}
        </p>
      )}

      {pending && !lockedState && (
        <p className="text-center text-xs text-white/40">Saving…</p>
      )}

      <KnockoutBracketView
        data={data}
        editable={!lockedState && unlocked}
        hintText="Tap a match to pick the winner. Only the two teams in that match can be selected."
        onSetWinner={handleSetWinner}
      />

      {isComplete && lockedState && (
        <p className="text-center text-xs text-white/40">
          Your full knockout prediction has been saved.
        </p>
      )}
    </div>
  );
}
