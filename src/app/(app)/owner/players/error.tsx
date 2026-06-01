"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OwnerPlayersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-white/95 p-6 shadow-lg ring-1 ring-black/5">
      <h2 className="text-lg font-bold text-[#081120]">Could not load Players & Teams</h2>
      <p className="text-sm text-[#081120]/60">
        {error.message || "A server error occurred. Try setup below or go back."}
      </p>
      {error.digest && (
        <p className="text-xs text-[#081120]/40">Reference: {error.digest}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/owner/players">
          <Button type="button" variant="outline">
            Open Players & Teams
          </Button>
        </Link>
        <Link href="/owner">
          <Button type="button" variant="outline">
            Owner dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
