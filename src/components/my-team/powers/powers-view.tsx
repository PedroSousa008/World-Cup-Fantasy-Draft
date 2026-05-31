"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { MOCK_POWERS, type PowerCard } from "@/lib/mock/my-team-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  available: {
    label: "Available",
    badge: "bg-[#00C853]/15 text-[#00A844]",
    card: "opacity-100",
  },
  used: {
    label: "Used",
    badge: "bg-[#081120]/10 text-[#081120]/50",
    card: "opacity-75",
  },
  expired: {
    label: "Expired",
    badge: "bg-[#081120]/10 text-[#081120]/40",
    card: "opacity-60",
  },
  locked: {
    label: "Locked",
    badge: "bg-[#081120]/8 text-[#081120]/35",
    card: "opacity-50 grayscale",
  },
};

function PowerCardItem({
  power,
  onTap,
}: {
  power: PowerCard;
  onTap: () => void;
}) {
  const style = STATUS_STYLES[power.status];

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={power.status === "locked"}
      className={cn(
        "wc-card w-full p-4 text-left transition-all active:scale-[0.98]",
        style.card,
        power.status === "locked" && "cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF]/15 to-[#00C853]/15 text-2xl">
          {power.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-[#081120]">{power.name}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                style.badge
              )}
            >
              {style.label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#081120]/55">
            {power.description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function PowersView() {
  const [selected, setSelected] = useState<PowerCard | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const available = MOCK_POWERS.filter((p) => p.status === "available");
  const usedHistory = MOCK_POWERS.filter((p) => p.history);

  return (
    <div className="space-y-5 px-4 pb-4">
      <div>
        <h2 className="text-display text-xl">Powers</h2>
        <p className="text-body text-sm">
          {available.length} power{available.length !== 1 ? "s" : ""} ready to deploy
        </p>
      </div>

      <div className="space-y-3">
        {MOCK_POWERS.map((power) => (
          <PowerCardItem
            key={power.id}
            power={power}
            onTap={() => {
              setSelected(power);
              setSheetOpen(true);
            }}
          />
        ))}
      </div>

      {usedHistory.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/45">
            Power History
          </p>
          <div className="space-y-2">
            {usedHistory.map((power) => (
              <div
                key={power.id}
                className="rounded-xl bg-white/5 px-4 py-3"
              >
                <p className="font-bold text-white">{power.name}</p>
                {power.history?.target && (
                  <p className="text-sm text-white/60">
                    Used on {power.history.target}
                  </p>
                )}
                {power.history?.matchday && (
                  <p className="text-xs text-white/40">
                    Matchday {power.history.matchday}
                  </p>
                )}
                {power.history?.bonus && (
                  <p className="mt-1 text-sm font-bold text-[#00C853]">
                    {power.history.bonus}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selected?.name}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0066FF]/15 to-[#00C853]/15 text-4xl">
                {selected.icon}
              </span>
            </div>
            <p className="text-center text-sm leading-relaxed text-[#081120]/65">
              {selected.description}
            </p>
            <span
              className={cn(
                "mx-auto block w-fit rounded-full px-3 py-1 text-xs font-bold uppercase",
                STATUS_STYLES[selected.status].badge
              )}
            >
              {STATUS_STYLES[selected.status].label}
            </span>
            {selected.status === "available" ? (
              <>
                <p className="text-center text-xs text-[#081120]/45">
                  Select a target player or matchday to activate
                </p>
                <Button className="h-14 w-full text-base" onClick={() => setSheetOpen(false)}>
                  Activate {selected.name}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full border-[#081120]/15 text-[#081120]"
                onClick={() => setSheetOpen(false)}
              >
                Close
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
