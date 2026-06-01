"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NationsGrid } from "@/components/owner/nations-grid";
import { Button } from "@/components/ui/button";
import {
  setupOwnerPlayersDatabaseAction,
  syncWorldCupNationsAction,
} from "@/lib/actions/owner/nations";
import type { NationListItem } from "@/lib/owner/get-nations-data";

interface OwnerPlayersPanelProps {
  nations: NationListItem[];
  error: string | null;
  needsSetup: boolean;
}

export function OwnerPlayersPanel({ nations, error, needsSetup }: OwnerPlayersPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(error);

  const runSetup = (fn: () => Promise<{ ok: boolean; error?: string; data?: unknown }>) => {
    setLocalError(null);
    setMessage(null);
    startTransition(() => {
      void (async () => {
        const result = await fn();
        if (!result.ok) {
          setLocalError(result.error ?? "Setup failed");
          return;
        }
        setMessage(
          "data" in result && result.data && typeof result.data === "object" && "message" in result.data
            ? String((result.data as { message: string }).message)
            : "Nations ready."
        );
        router.refresh();
      })();
    });
  };

  if (localError && nations.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl bg-white/95 p-6 shadow-lg ring-1 ring-black/5">
        <h3 className="font-bold text-[#081120]">Database setup required</h3>
        <p className="text-sm text-[#E53935]">{localError}</p>
        <p className="text-sm text-[#081120]/60">
          Tap below to add nation columns and sync all 48 World Cup nations. This is safe to run
          once on production.
        </p>
        <Button
          disabled={pending}
          onClick={() => runSetup(setupOwnerPlayersDatabaseAction)}
          className="w-full sm:w-auto"
        >
          {pending ? "Setting up…" : "Set up nations & database"}
        </Button>
      </div>
    );
  }

  if (needsSetup && nations.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
        <h3 className="font-bold text-[#081120]">No nations added yet</h3>
        <p className="text-sm text-[#081120]/60">
          Sync the 48 participating World Cup nations to start adding players and images.
        </p>
        {message && (
          <p className="rounded-lg bg-[#00C853]/10 px-3 py-2 text-sm text-[#00A844]">{message}</p>
        )}
        {localError && (
          <p className="rounded-lg bg-[#E53935]/10 px-3 py-2 text-sm text-[#E53935]">{localError}</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            disabled={pending}
            onClick={() => runSetup(setupOwnerPlayersDatabaseAction)}
          >
            {pending ? "Working…" : "Add nations"}
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => runSetup(syncWorldCupNationsAction)}
          >
            Sync nations only
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localError && (
        <p className="rounded-xl bg-[#E53935]/10 px-4 py-3 text-sm text-[#E53935]">{localError}</p>
      )}
      {message && (
        <p className="rounded-xl bg-[#00C853]/10 px-4 py-3 text-sm text-[#00A844]">{message}</p>
      )}
      <NationsGrid nations={nations} />
    </div>
  );
}
