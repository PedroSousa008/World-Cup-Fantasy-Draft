"use client";

import { useCallback, useEffect, useState } from "react";
import { TableView } from "@/components/tournament/table-view";
import type { GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";

interface GroupTablesResponse {
  tables: GroupTable[];
  bestThird: ThirdPlaceRow[];
  fetchedAt: string;
}

const POLL_MS = 8000;

export function GroupStageTablesClient({
  showOverrideBadges = false,
}: {
  showOverrideBadges?: boolean;
}) {
  const [data, setData] = useState<GroupTablesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament/group-tables", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as GroupTablesResponse;
      setData(json);
      setError(null);
    } catch {
      setError("Could not load group tables.");
    }
  }, []);

  useEffect(() => {
    void fetchTables();
    const interval = window.setInterval(() => void fetchTables(), POLL_MS);
    const onFocus = () => void fetchTables();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void fetchTables();
    });
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchTables]);

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
        <button
          type="button"
          onClick={() => void fetchTables()}
          className="ml-2 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  return <TableView tables={data.tables} bestThird={data.bestThird} showOverrideBadges={showOverrideBadges} />;
}
