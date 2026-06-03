"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { getNationFlag } from "@/lib/nations";
import { saveGroupPredictionAction } from "@/lib/actions/predictions/group-predictions";
import type { GroupPredictionState } from "@/lib/predictions/get-tournament-predictions-data";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { cn } from "@/lib/utils";

const POSITION_LABELS = ["1st place", "2nd place", "3rd place", "4th place"] as const;

interface GroupPredictionCardProps {
  group: GroupPredictionState;
  disabled?: boolean;
  onSaved?: () => void;
}

export function GroupPredictionCard({ group, disabled, onSaved }: GroupPredictionCardProps) {
  const [positions, setPositions] = useState(group.positions);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const savedKey = group.positions.join("|");

  useEffect(() => {
    setPositions(group.positions);
  }, [group.groupName, savedKey, group.positions]);

  const usedIds = useMemo(
    () => new Set(positions.filter(Boolean) as string[]),
    [positions]
  );

  const isComplete = positions.every(Boolean);

  const save = (next: [string | null, string | null, string | null, string | null]) => {
    if (!next.every(Boolean)) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await saveGroupPredictionAction({
          groupName: group.groupName,
          firstPlaceId: next[0]!,
          secondPlaceId: next[1]!,
          thirdPlaceId: next[2]!,
          fourthPlaceId: next[3]!,
        });
        if (!result.ok) {
          setError(result.error ?? "Could not save.");
          return;
        }
        onSaved?.();
      })();
    });
  };

  const pickTeam = (teamId: string) => {
    if (pickerIndex == null) return;
    const next = [...positions] as [string | null, string | null, string | null, string | null];
    next[pickerIndex] = teamId;
    setPositions(next);
    setPickerIndex(null);
    if (next.every(Boolean)) save(next);
  };

  const availableTeams = group.teams.filter(
    (t) => !usedIds.has(t.id) || positions[pickerIndex ?? -1] === t.id
  );

  return (
    <div className="wc-card-dark rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black tracking-widest text-white">
          GROUP {group.groupName}
        </h3>
        {isComplete && (
          <span className="rounded-full bg-[#00C853]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#00C853]">
            Complete
          </span>
        )}
      </div>

      <div className="space-y-2">
        {POSITION_LABELS.map((label, index) => {
          const teamId = positions[index];
          const team = group.teams.find((t) => t.id === teamId) ?? null;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled || pending}
              onClick={() => setPickerIndex(index)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left transition-colors active:bg-white/[0.06] disabled:opacity-50"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
                {label}
              </span>
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
                {team ? (
                  <>
                    <span>{team.flagEmoji ?? getNationFlag(team.name)}</span>
                    <span className="truncate">{team.name}</span>
                  </>
                ) : (
                  <span className="text-white/35">Select team</span>
                )}
                <ChevronDown className="h-4 w-4 shrink-0 text-white/30" />
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-[#E53935]">{error}</p>}
      {pending && <p className="mt-2 text-xs text-white/40">Saving…</p>}

      <MobileFullScreenModal
        open={pickerIndex != null}
        onClose={() => setPickerIndex(null)}
        title={`Group ${group.groupName}`}
        subtitle={pickerIndex != null ? POSITION_LABELS[pickerIndex] : undefined}
      >
        <div className="space-y-2">
          {availableTeams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => pickTeam(team.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left ring-1 ring-white/10 active:scale-[0.99]",
                positions[pickerIndex ?? -1] === team.id && "ring-[#0066FF]"
              )}
            >
              <span className="text-2xl">{team.flagEmoji ?? getNationFlag(team.name)}</span>
              <span className="font-semibold text-white">{team.name}</span>
            </button>
          ))}
        </div>
      </MobileFullScreenModal>
    </div>
  );
}

interface GroupStagePredictionsClientProps {
  groups: GroupPredictionState[];
  completedGroupCount: number;
  allGroupsComplete: boolean;
  knockoutUnlocked: boolean;
}

export function GroupStagePredictionsClient({
  groups,
  completedGroupCount,
  allGroupsComplete,
  knockoutUnlocked,
}: GroupStagePredictionsClientProps) {
  const router = useRouter();

  if (groups.length === 0 || groups.every((g) => g.teams.length === 0)) {
    return (
      <div className="wc-card-dark rounded-2xl px-4 py-10 text-center">
        <p className="text-sm text-white/55">No tournament groups available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/8">
        <p className="text-sm text-white/60">Group stage progress</p>
        <p className="text-sm font-bold tabular-nums text-[#0066FF]">
          {completedGroupCount}/12 groups
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <GroupPredictionCard
            key={group.groupName}
            group={group}
            onSaved={() => router.refresh()}
          />
        ))}
      </div>

      <div className="sticky bottom-4 z-10 pt-2">
        {allGroupsComplete && knockoutUnlocked ? (
          <Link
            href="/predictions/tournament/knockout"
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#0066FF] text-base font-bold text-white shadow-lg shadow-[#0066FF]/25 active:scale-[0.99]"
          >
            KO Stages
          </Link>
        ) : allGroupsComplete && !knockoutUnlocked ? (
          <div className="wc-card-dark flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-4 text-center">
            <Lock className="h-4 w-4 shrink-0 text-white/40" />
            <p className="text-sm text-white/55">
              KO Stages unlock after the Group Stage is complete.
            </p>
          </div>
        ) : (
          <div className="wc-card-dark flex min-h-[52px] items-center justify-center rounded-2xl px-4">
            <p className="text-sm text-white/45">Complete all groups first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
