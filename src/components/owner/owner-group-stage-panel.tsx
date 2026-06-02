"use client";

import { useState, useTransition } from "react";
import { TableView } from "@/components/tournament/table-view";
import type { GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";
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

interface OwnerGroupStagePanelProps {
  tables: GroupTable[];
  bestThird: ThirdPlaceRow[];
  overrides: OverrideRow[];
}

export function OwnerGroupStagePanel({
  tables,
  bestThird,
  overrides,
}: OwnerGroupStagePanelProps) {
  const [editTeamId, setEditTeamId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">
        Tables update automatically from match results. Tap a team below to correct stats
        manually if needed.
      </p>

      <TableView tables={tables} bestThird={bestThird} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Manual corrections</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {tables.flatMap((t) =>
            t.rows.map((row) => (
              <button
                key={row.teamId}
                type="button"
                onClick={() => setEditTeamId(row.teamId)}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left text-sm ring-1 ring-white/10"
              >
                <span className="font-semibold text-white">
                  {row.flagEmoji} {row.teamName}
                </span>
                <span className="text-white/50">
                  Grp {t.group} · {row.points} pts
                  {overrides.some((o) => o.nationalTeamId === row.teamId) && " · edited"}
                </span>
              </button>
            ))
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
          onClose={() => setEditTeamId(null)}
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
              ["played", "P"],
              ["won", "W"],
              ["drawn", "D"],
              ["lost", "L"],
              ["goalsFor", "GF"],
              ["goalsAgainst", "GA"],
              ["points", "Pts"],
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
        <div className="mt-4 flex gap-2">
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
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Reset
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
