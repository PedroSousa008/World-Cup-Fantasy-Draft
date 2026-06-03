"use client";

import { useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addRankingOutcomeRowAction,
  deleteRankingOutcomeRowAction,
  upsertRankingOutcomeRowAction,
} from "@/lib/actions/bets";
import type { RankingOutcomeRowDto } from "@/lib/bets/types";
import { invalidatePunishmentsRewardsCache } from "@/lib/bets/punishments-rewards-cache";
import { usePunishmentsRewards } from "@/hooks/use-punishments-rewards";
import { PunishmentsRewardsSkeleton } from "@/components/bets/punishments-rewards-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PunishmentsRewardsViewProps {
  initialRows: RankingOutcomeRowDto[];
  /** Set on server from platform owner check — never from poll/API. */
  canEdit: boolean;
}

export function PunishmentsRewardsView({ initialRows, canEdit }: PunishmentsRewardsViewProps) {
  const [pending, startTransition] = useTransition();
  const { payload, loading, refresh } = usePunishmentsRewards({ initialRows });
  const { rows, currentUserRank } = payload;

  const saveRow = (position: number, text: string) => {
    if (!canEdit) return;
    startTransition(() => {
      void upsertRankingOutcomeRowAction({ position, text }).then((result) => {
        if (result.ok) {
          invalidatePunishmentsRewardsCache();
          void refresh();
        }
      });
    });
  };

  const addRow = () => {
    if (!canEdit) return;
    startTransition(() => {
      void addRankingOutcomeRowAction().then((result) => {
        if (result.ok) {
          invalidatePunishmentsRewardsCache();
          void refresh();
        }
      });
    });
  };

  const removeRow = (position: number) => {
    if (!canEdit) return;
    startTransition(() => {
      void deleteRankingOutcomeRowAction(position).then((result) => {
        if (result.ok) {
          invalidatePunishmentsRewardsCache();
          void refresh();
        }
      });
    });
  };

  const showSkeleton = loading && rows.length === 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/50">
        {canEdit
          ? "Edit rewards and punishments by ranking position. Changes sync to all users automatically."
          : "Rewards and punishments by final ranking position. Your current league rank is highlighted."}
      </p>

      {showSkeleton ? (
        <PunishmentsRewardsSkeleton rowCount={initialRows.length || 10} />
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <div className="grid grid-cols-[3.5rem_1fr] border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-white/45">
            <div className="px-3 py-3 text-center">Position</div>
            <div className="px-3 py-3">Reward / Punishment</div>
          </div>

          <ul>
            {rows.map((row) => {
              const isHighlighted = currentUserRank === row.position;
              return (
                <li
                  key={row.position}
                  className={cn(
                    "grid grid-cols-[3.5rem_1fr] border-b border-white/[0.06] last:border-b-0 transition-colors duration-300",
                    isHighlighted
                      ? "bg-gradient-to-r from-[#0066FF]/20 via-[#FFD700]/10 to-transparent ring-1 ring-inset ring-[#FFD700]/25"
                      : "bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center border-r border-white/[0.06] py-3 text-sm font-black tabular-nums",
                      isHighlighted ? "text-[#FFD700]" : "text-white/70"
                    )}
                  >
                    {row.position}
                  </div>
                  <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                    {canEdit ? (
                      <>
                        <input
                          type="text"
                          defaultValue={row.text}
                          key={`${row.position}-${row.text}`}
                          disabled={pending}
                          placeholder="Enter reward or punishment…"
                          className="min-h-[40px] w-full min-w-0 rounded-lg border-0 bg-white/[0.06] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
                          onBlur={(e) => {
                            if (e.target.value !== row.text) {
                              saveRow(row.position, e.target.value);
                            }
                          }}
                        />
                        {rows.length > 1 && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => removeRow(row.position)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#E53935]/80 hover:bg-[#E53935]/10"
                            aria-label={`Remove position ${row.position}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <p
                        className={cn(
                          "min-h-[40px] w-full py-2 text-sm",
                          row.text ? "text-white/90" : "text-white/30 italic",
                          isHighlighted && "font-semibold text-white"
                        )}
                      >
                        {row.text || "—"}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {canEdit && !showSkeleton && (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={addRow}
          className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add position
        </Button>
      )}

      {currentUserRank != null && !showSkeleton && (
        <p className="text-center text-xs text-white/40">
          You are currently ranked{" "}
          <span className="font-bold text-[#FFD700]">#{currentUserRank}</span> in the league.
        </p>
      )}
    </div>
  );
}
