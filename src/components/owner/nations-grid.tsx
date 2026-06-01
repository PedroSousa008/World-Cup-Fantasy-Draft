"use client";

import Link from "next/link";
import { useTransition } from "react";
import { syncWorldCupNationsAction } from "@/lib/actions/owner/nations";
import type { NationListItem } from "@/lib/owner/get-nations-data";
import { Button } from "@/components/ui/button";
import { getNationFlag } from "@/lib/nations";

interface NationsGridProps {
  nations: NationListItem[];
}

export function NationsGrid({ nations }: NationsGridProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#081120]/60">
          {nations.length} nations · add player images per folder under{" "}
          <code className="rounded bg-[#081120]/5 px-1">public/players/</code>
        </p>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => {
            startTransition(() => {
              void syncWorldCupNationsAction();
            });
          }}
        >
          {pending ? "Syncing…" : "Sync nations"}
        </Button>
      </div>

      {nations.length === 0 ? (
        <p className="rounded-2xl bg-white/95 p-6 text-center text-sm text-[#081120]/50">
          No nations in database. Run{" "}
          <code className="rounded bg-[#081120]/5 px-1">npm run nations:setup</code> or tap
          Sync nations.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {nations.map((nation) => (
            <Link
              key={nation.id}
              href={`/owner/players/${nation.slug}`}
              className="rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {nation.flagEmoji ?? getNationFlag(nation.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#081120]">{nation.name}</p>
                  <p className="text-[10px] text-[#081120]/45">
                    {nation.playerCount} players · {nation.imageDir}
                  </p>
                </div>
              </div>
              {!nation.isActive && (
                <span className="mt-2 inline-block rounded-full bg-[#081120]/10 px-2 py-0.5 text-[9px] font-bold text-[#081120]/50">
                  Inactive
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
