"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/card";
import { MatchCard } from "@/components/tournament/match-card";
import { MatchDetailSheet } from "@/components/tournament/match-detail-sheet";
import {
  formatKickoffDate,
  sameCalendarDay,
  startOfWeekUtc,
} from "@/lib/tournament/format";
import type { TournamentMatchCard } from "@/lib/tournament/types";

type ViewMode = "monthly" | "weekly" | "daily";

interface CalendarViewProps {
  matches: TournamentMatchCard[];
}

export function CalendarView({ matches }: CalendarViewProps) {
  const [mode, setMode] = useState<ViewMode>("monthly");
  const [selected, setSelected] = useState<TournamentMatchCard | null>(null);

  const sorted = useMemo(
    () => [...matches].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [matches]
  );

  const grouped = useMemo(() => {
    if (mode === "daily") {
      const map = new Map<string, TournamentMatchCard[]>();
      for (const m of sorted) {
        const key = formatKickoffDate(m.scheduledAt);
        const list = map.get(key) ?? [];
        list.push(m);
        map.set(key, list);
      }
      return [...map.entries()].map(([label, items]) => ({ label, items }));
    }
    if (mode === "weekly") {
      const map = new Map<string, TournamentMatchCard[]>();
      for (const m of sorted) {
        const weekStart = startOfWeekUtc(m.scheduledAt);
        const key = `Week of ${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
        const list = map.get(key) ?? [];
        list.push(m);
        map.set(key, list);
      }
      return [...map.entries()].map(([label, items]) => ({ label, items }));
    }
    const map = new Map<string, TournamentMatchCard[]>();
    for (const m of sorted) {
      const d = new Date(m.scheduledAt);
      const key = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }, [sorted, mode]);

  if (matches.length === 0) {
    return (
      <EmptyState
        title="Calendar is empty"
        description="Matches appear here once the tournament schedule is seeded."
        accent="blue"
      />
    );
  }

  const todayMatches =
    mode === "daily"
      ? sorted.filter((m) => sameCalendarDay(m.scheduledAt, new Date().toISOString()))
      : [];

  return (
    <>
      <SegmentedControl
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "weekly", label: "Weekly" },
          { value: "daily", label: "Daily" },
        ]}
        value={mode}
        onChange={(v) => setMode(v as ViewMode)}
      />

      {mode === "daily" && todayMatches.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#00C853]">Today</h3>
          {todayMatches.map((m) => (
            <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} />
          ))}
        </section>
      )}

      <div className="space-y-6">
        {grouped.map((section) => (
          <section key={section.label} className="space-y-3">
            <h3 className="text-sm font-semibold text-white/70">{section.label}</h3>
            <div className="grid gap-3">
              {section.items.map((m) => (
                <MatchCard key={m.id} match={m} onClick={() => setSelected(m)} compact />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <MatchDetailSheet match={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
