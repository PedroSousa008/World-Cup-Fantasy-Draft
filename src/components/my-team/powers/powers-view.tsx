"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PowerActivateSheet } from "@/components/my-team/powers/power-activate-sheet";
import { Button } from "@/components/ui/button";
import {
  acceptRivalChallengeAction,
  declineRivalChallengeAction,
  markNotificationReadAction,
} from "@/lib/actions/powers";
import type { PowerCardData, PowersPageData } from "@/lib/powers/types";
import type { PowerDisplayStatus } from "@/lib/powers/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  PowerDisplayStatus,
  { label: string; badge: string; card: string }
> = {
  available: {
    label: "Available",
    badge: "bg-[#00C853]/15 text-[#00A844]",
    card: "",
  },
  pending: {
    label: "Pending",
    badge: "bg-[#FFD700]/20 text-[#B8860B]",
    card: "ring-1 ring-[#FFD700]/30",
  },
  active: {
    label: "Active",
    badge: "bg-[#0066FF]/15 text-[#0066FF]",
    card: "ring-2 ring-[#0066FF]/35",
  },
  used: {
    label: "Used",
    badge: "bg-[#081120]/10 text-[#081120]/50",
    card: "opacity-60 grayscale",
  },
  expired: {
    label: "Expired",
    badge: "bg-[#081120]/10 text-[#081120]/40",
    card: "opacity-50 grayscale",
  },
  awaiting_acceptance: {
    label: "Awaiting",
    badge: "bg-[#FFD700]/20 text-[#B8860B]",
    card: "ring-1 ring-[#FFD700]/25",
  },
};

function PowerCardItem({
  power,
  onTap,
}: {
  power: PowerCardData;
  onTap: () => void;
}) {
  const style = STATUS_CONFIG[power.displayStatus];
  const isDisabled =
    power.displayStatus === "used" ||
    power.displayStatus === "expired" ||
    power.displayStatus === "awaiting_acceptance";

  return (
    <div
      role={isDisabled ? undefined : "button"}
      tabIndex={isDisabled ? undefined : 0}
      onClick={isDisabled ? undefined : onTap}
      onKeyDown={
        isDisabled
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onTap();
            }
      }
      className={cn(
        "rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5 transition-all",
        !isDisabled && "cursor-pointer active:scale-[0.99]",
        style.card
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF]/15 to-[#00C853]/15 text-2xl">
          {power.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
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
          {power.matchday != null && (
            <p className="mt-1.5 text-[10px] font-semibold text-[#0066FF]">
              Matchday {power.matchday}
              {power.targetLabel ? ` · ${power.targetLabel}` : ""}
            </p>
          )}
          {power.displayStatus === "used" && power.pointsEffect != null && (
            <p className="mt-1 text-sm font-black tabular-nums text-[#00C853]">
              {power.pointsEffect >= 0 ? "+" : ""}
              {power.pointsEffect} pts
            </p>
          )}
          {power.resultSummary && power.displayStatus === "used" && (
            <p className="mt-0.5 text-[10px] text-[#081120]/45">{power.resultSummary}</p>
          )}
          {power.canActivate && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#0066FF]">
              Tap to activate
            </p>
          )}
          {power.displayStatus === "pending" && power.type === "WILDCARD" && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#0066FF]">
              Tap to make transfers
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PowersViewProps {
  data: PowersPageData;
}

export function PowersView({ data }: PowersViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<PowerCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const availableCount = data.powers.filter((p) => p.displayStatus === "available").length;
  const unreadCount = data.notifications.filter((n) => !n.read).length;

  const handlePowerTap = (power: PowerCardData) => {
    if (power.displayStatus === "used" || power.displayStatus === "expired") return;
    if (power.displayStatus === "awaiting_acceptance") return;

    if (power.displayStatus === "pending" && power.type === "WILDCARD") {
      setSelected(power);
      setSheetOpen(true);
      return;
    }

    if (power.canActivate || (power.type === "WILDCARD" && data.wildcardActive)) {
      setSelected(power);
      setSheetOpen(true);
    }
  };

  return (
    <div className="space-y-5 overflow-x-hidden px-4 pb-6">
      <div>
        <h2 className="text-display text-xl">Powers</h2>
        <p className="text-body text-sm">
          {availableCount} power{availableCount !== 1 ? "s" : ""} available · each usable
          once per tournament
        </p>
      </div>

      {data.pendingRivalChallenges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-white/45">
            Rival Challenges
          </p>
          {data.pendingRivalChallenges.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5"
            >
              <p className="text-sm font-bold text-[#081120]">
                {c.isIncoming
                  ? `${c.challengerTeamName} challenged you`
                  : `Waiting for ${c.opponentTeamName}`}
              </p>
              <p className="text-xs text-[#081120]/50">Matchday {c.matchday}</p>
              {c.isIncoming && (
                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      startTransition(() => {
                        void acceptRivalChallengeAction(c.id).then(() =>
                          router.refresh()
                        );
                      });
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#081120]/15 text-[#081120]"
                    onClick={() => {
                      startTransition(() => {
                        void declineRivalChallengeAction(c.id).then(() =>
                          router.refresh()
                        );
                      });
                    }}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {unreadCount > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-white/45">
            Notifications
          </p>
          {data.notifications
            .filter((n) => !n.read)
            .slice(0, 5)
            .map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    void markNotificationReadAction(n.id).then(() => router.refresh());
                  });
                }}
                className="w-full rounded-xl bg-[#0066FF]/15 px-4 py-3 text-left ring-1 ring-[#0066FF]/25"
              >
                <p className="text-sm font-bold text-white">{n.title}</p>
                <p className="text-xs text-white/60">{n.body}</p>
              </button>
            ))}
        </div>
      )}

      <div className="space-y-3">
        {data.powers.map((power) => (
          <PowerCardItem
            key={power.type}
            power={power}
            onTap={() => handlePowerTap(power)}
          />
        ))}
      </div>

      {data.history.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/45">
            Power History
          </p>
          <div className="space-y-2">
            {data.history.map((entry) => (
              <div
                key={`${entry.powerType}-${entry.settledAt}`}
                className="rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{entry.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#081120]">{entry.name}</p>
                    {entry.matchday != null && (
                      <p className="text-xs text-[#081120]/50">
                        Matchday {entry.matchday}
                      </p>
                    )}
                    {entry.targetLabel && (
                      <p className="text-sm text-[#081120]/65">
                        Target: {entry.targetLabel}
                      </p>
                    )}
                    {entry.resultLabel && (
                      <p className="mt-1 text-xs text-[#081120]/50">{entry.resultLabel}</p>
                    )}
                    {entry.pointsEffect != null && (
                      <p className="mt-1 text-sm font-black text-[#00C853]">
                        {entry.pointsEffect >= 0 ? "+" : ""}
                        {entry.pointsEffect} pts
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PowerActivateSheet
        power={selected}
        data={data}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
