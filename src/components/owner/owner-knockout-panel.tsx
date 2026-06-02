"use client";

import { useState, useTransition } from "react";
import type { ProgressionStage } from "@prisma/client";
import {
  confirmNationProgressionAction,
  removeNationProgressionAction,
} from "@/lib/actions/owner/progression";
import {
  PROGRESSION_STAGE_ORDER,
  PROGRESSION_STAGE_LABELS,
  PROGRESSION_STAGE_POINTS,
} from "@/lib/scoring/progression";
import { getNationFlag } from "@/lib/nations";

export interface OwnerKnockoutNation {
  id: string;
  name: string;
  flagEmoji: string | null;
  groupName: string | null;
  stages: ProgressionStage[];
}

export function OwnerKnockoutPanel({ nations }: { nations: OwnerKnockoutNation[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleConfirm = (nationalTeamId: string, stage: ProgressionStage) => {
    startTransition(async () => {
      const res = await confirmNationProgressionAction(nationalTeamId, stage);
      setMessage(res.ok ? null : res.error ?? "Failed.");
    });
  };

  const handleRemove = (nationalTeamId: string, stage: ProgressionStage) => {
    startTransition(async () => {
      const res = await removeNationProgressionAction(nationalTeamId, stage);
      setMessage(res.ok ? null : res.error ?? "Failed.");
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">
        Confirm each stage once. Every player from that nation receives the bonus points
        automatically (Last 16 +3, QF +4, SF +5, Final +6, Winner +10). Stages must be
        confirmed in order.
      </p>

      {message && (
        <p className="rounded-xl bg-[#E53935]/15 px-3 py-2 text-sm text-[#FF8A80]">{message}</p>
      )}

      <div className="space-y-4">
        {PROGRESSION_STAGE_ORDER.map((stage) => (
          <section
            key={stage}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <h3 className="font-bold text-white">
              {PROGRESSION_STAGE_LABELS[stage]}
              <span className="ml-2 text-sm font-normal text-[#00C853]">
                +{PROGRESSION_STAGE_POINTS[stage]} pts / player
              </span>
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {nations.map((n) => {
                const confirmed = n.stages.includes(stage);
                const prevIndex = PROGRESSION_STAGE_ORDER.indexOf(stage) - 1;
                const prevOk =
                  prevIndex < 0 ||
                  n.stages.includes(PROGRESSION_STAGE_ORDER[prevIndex]);

                return (
                  <button
                    key={`${n.id}-${stage}`}
                    type="button"
                    disabled={pending || (!confirmed && !prevOk)}
                    onClick={() =>
                      confirmed
                        ? handleRemove(n.id, stage)
                        : handleConfirm(n.id, stage)
                    }
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                      confirmed
                        ? "bg-[#00C853]/25 text-[#00C853] ring-1 ring-[#00C853]/40"
                        : prevOk
                          ? "bg-white/10 text-white hover:bg-white/15"
                          : "cursor-not-allowed bg-white/5 text-white/30"
                    }`}
                  >
                    {n.flagEmoji ?? getNationFlag(n.name)} {n.name}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
