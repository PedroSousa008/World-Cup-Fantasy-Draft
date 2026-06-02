"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { KnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";
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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
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
  }, [editable, reloadKey]);

  const onMutated = () => setReloadKey((k) => k + 1);

  if (error) {
    return <p className="py-8 text-center text-sm text-[#FF8A80]">{error}</p>;
  }

  if (!data) {
    return <KnockoutBracketSkeleton />;
  }

  return <KnockoutBracketView data={data} editable={editable} onMutated={onMutated} />;
}
