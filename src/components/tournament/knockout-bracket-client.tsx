"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { KnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";
import {
  applySlotAssignment,
  applyWinnerSelection,
} from "@/lib/tournament/knockout/bracket-client-mutate";
import {
  assignKnockoutSlotAction,
  setKnockoutWinnerAction,
} from "@/lib/actions/owner/knockout-bracket";
import { KnockoutBracketSkeleton } from "@/components/tournament/knockout-bracket-skeleton";

const KnockoutBracketView = dynamic(
  () =>
    import("@/components/tournament/knockout-bracket-view").then((m) => m.KnockoutBracketView),
  { loading: () => <KnockoutBracketSkeleton />, ssr: false }
);

interface KnockoutBracketClientProps {
  editable?: boolean;
}

export function KnockoutBracketClient({ editable = false }: KnockoutBracketClientProps) {
  const [data, setData] = useState<KnockoutBracketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<KnockoutBracketData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    const params = editable ? "?picker=1" : "";
    fetch(`/api/tournament/knockout-bracket${params}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load bracket");
        return res.json() as Promise<KnockoutBracketData>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load bracket. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [editable]);

  const handleAssignSlot = useCallback(
    async (slotKey: string, nationalTeamId: string | null) => {
      const current = dataRef.current;
      if (!current) return;

      const nation =
        nationalTeamId != null
          ? current.nations.find((n) => n.id === nationalTeamId) ?? null
          : null;

      const optimistic = applySlotAssignment(current, slotKey, nationalTeamId, nation);
      setData(optimistic);
      setError(null);

      const res = await assignKnockoutSlotAction(slotKey, nationalTeamId);
      if (res.ok && res.data) {
        setData(res.data);
      } else if (!res.ok) {
        setData(current);
        setError(res.error ?? "Could not update bracket.");
      }
    },
    []
  );

  const handleSetWinner = useCallback(async (matchKey: string, winnerNationalTeamId: string) => {
    const current = dataRef.current;
    if (!current) return;

    const optimistic = applyWinnerSelection(current, matchKey, winnerNationalTeamId);
    setData(optimistic);
    setError(null);

    const res = await setKnockoutWinnerAction(matchKey, winnerNationalTeamId);
    if (res.ok && res.data) {
      setData(res.data);
    } else if (!res.ok) {
      setData(current);
      setError(res.error ?? "Could not set winner.");
    }
  }, []);

  if (error && !data) {
    return <p className="py-8 text-center text-sm text-[#FF8A80]">{error}</p>;
  }

  if (!data) {
    return <KnockoutBracketSkeleton />;
  }

  return (
    <>
      {error && (
        <p className="mb-2 text-center text-sm text-[#FF8A80]" role="alert">
          {error}
        </p>
      )}
      <KnockoutBracketView
        data={data}
        editable={editable}
        onAssignSlot={editable ? handleAssignSlot : undefined}
        onSetWinner={editable ? handleSetWinner : undefined}
      />
    </>
  );
}
