"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { GroupStageTablesClient } from "@/components/tournament/group-stage-tables-client";
import type { GroupTable } from "@/lib/tournament/types";
import {
  saveGroupStandingOverrideAction,
  clearGroupStandingOverrideAction,
} from "@/lib/actions/owner/standings";

interface OverrideRow {
  nationalTeamId: string;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  points: number | null;
}

export function OwnerGroupStagePanel() {
  const [tables, setTables] = useState<GroupTable[]>([]);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/tournament/group-tables?overrides=1", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setTables(json.tables);
    setOverrides(json.overrides ?? []);
  }, []);

  useEffect(() => {
    void fetchData();
    const interval = window.setInterval(() => void fetchData(), 8000);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">
        Tables update automatically from match results. Tap a team below to correct stats
        manually if needed.
      </p>

      <GroupStageTablesClient showOverrideBadges />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Manual corrections</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tables.flatMap((t) =>
            t.rows.map((row) => {
              const hasOverride = row.manualOverride;
              return (
                <button
                  key={row.teamId}
                  type="button"
                  onClick={() => setEditTeamId(row.teamId)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ring-1 transition-colors",
                    hasOverride
                      ? "bg-amber-500/10 ring-amber-400/40"
                      : "bg-white/5 ring-white/10 hover:bg-white/[0.08]"
                  )}
                >
                  <span className="font-semibold text-white">
                    <span className="mr-1.5">{row.flagEmoji}</span>
                    {row.teamName}
                  </span>
                  <span className="text-right text-white/50">
                    Grp {t.group} · {row.points} pts
                    {hasOverride && (
                      <span className="mt-0.5 block text-[10px] font-bold uppercase text-amber-400">
                        Override active
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {editTeamId && (
        <StandingEditModal
          teamId={editTeamId}
          teamName={
            tables.flatMap((t) => t.rows).find((r) => r.teamId === editTeamId)?.teamName ?? ""
          }
          row={tables.flatMap((t) => t.rows).find((r) => r.teamId === editTeamId)!}
          override={overrides.find((o) => o.nationalTeamId === editTeamId)}
          onClose={() => {
            setEditTeamId(null);
            void fetchData();
          }}
        />
      )}
    </div>
  );
}

function StandingEditModal({
  teamId,
  teamName,
  row,
  override,
  onClose,
}: {
  teamId: string;
  teamName: string;
  row: GroupTable["rows"][0];
  override?: OverrideRow;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    played: String(override?.played ?? row.played),
    won: String(override?.won ?? row.won),
    drawn: String(override?.drawn ?? row.drawn),
    lost: String(override?.lost ?? row.lost),
    goalsFor: String(override?.goalsFor ?? row.goalsFor),
    goalsAgainst: String(override?.goalsAgainst ?? row.goalsAgainst),
    points: String(override?.points ?? row.points),
  });

  const save = () => {
    startTransition(async () => {
      await saveGroupStandingOverrideAction({
        nationalTeamId: teamId,
        played: Number(form.played),
        won: Number(form.won),
        drawn: Number(form.drawn),
        lost: Number(form.lost),
        goalsFor: Number(form.goalsFor),
        goalsAgainst: Number(form.goalsAgainst),
        points: Number(form.points),
      });
      onClose();
    });
  };

  const reset = () => {
    startTransition(async () => {
      await clearGroupStandingOverrideAction(teamId);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1a2e] p-4 ring-1 ring-white/10">
        <h3 className="font-bold text-white">Edit {teamName}</h3>
        <p className="mt-1 text-xs text-white/50">Overrides auto-calculated values only.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(
            [
              ["played", "Games"],
              ["won", "W"],
              ["drawn", "D"],
              ["lost", "L"],
              ["goalsFor", "Goals For"],
              ["goalsAgainst", "Goals Against"],
              ["points", "Points"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-xs text-white/60">
              {label}
              <input
                type="number"
                min={0}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded-lg bg-black/40 px-2 py-2 text-sm text-white ring-1 ring-white/15"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="flex-1 rounded-xl bg-[#0066FF] py-2.5 text-sm font-bold text-white"
          >
            Save
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={reset}
            className="rounded-xl bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-200"
          >
            Remove override
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/70"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
