"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { PlayerAvatar } from "@/components/player/player-avatar";
import { OwnerPlayerAssignModal } from "@/components/owner/owner-player-assign-modal";
import {
  assignPlayerToOwnerRosterSlotAction,
  removePlayerFromOwnerRosterSlotAction,
} from "@/lib/actions/owner/players";
import { invalidateDraftCache } from "@/lib/draft/draft-cache";
import type { DraftPlayerCard } from "@/lib/draft/types";
import { getOwnerRosterGroups } from "@/lib/owner/owner-roster-slots";
import type { OwnerTeamCard } from "@/lib/owner/get-teams-data";
import { getPositionLabel } from "@/lib/players/types";
import type { PlayerPosition } from "@/lib/players/types";
import { getNationTheme } from "@/lib/nation-theme";
import { Button } from "@/components/ui/button";

interface OwnerTeamsPanelProps {
  teams: OwnerTeamCard[];
  pickerPlayers: DraftPlayerCard[];
}

interface PickerTarget {
  userId: string;
  teamName: string;
  slotOrder: number;
  position: PlayerPosition;
}

export function OwnerTeamsPanel({ teams, pickerPlayers }: OwnerTeamsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [picker, setPicker] = useState<PickerTarget | null>(null);

  const groups = useMemo(() => getOwnerRosterGroups(), []);

  const slotByUserAndOrder = useMemo(() => {
    const map = new Map<string, Map<number, OwnerTeamCard["slots"][0]>>();
    for (const team of teams) {
      const inner = new Map<number, OwnerTeamCard["slots"][0]>();
      for (const slot of team.slots) {
        inner.set(slot.slotOrder, slot);
      }
      map.set(team.userId, inner);
    }
    return map;
  }, [teams]);

  const handleAssign = (playerId: string) => {
    if (!picker) return;
    const target = picker;
    setPicker(null);
    startTransition(() => {
      void assignPlayerToOwnerRosterSlotAction({
        userId: target.userId,
        slotOrder: target.slotOrder,
        playerId,
      }).then((result) => {
        if (result.ok) {
          invalidateDraftCache();
          router.refresh();
        }
      });
    });
  };

  const handleRemove = (userId: string, slotOrder: number) => {
    startTransition(() => {
      void removePlayerFromOwnerRosterSlotAction({ userId, slotOrder }).then((result) => {
        if (result.ok) {
          invalidateDraftCache();
          router.refresh();
        }
      });
    });
  };

  if (teams.length === 0) {
    return (
      <p className="rounded-2xl bg-white/95 p-6 text-center text-sm text-[#081120]/50">
        No users in the league yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {teams.map((team) => {
          const nationTheme = getNationTheme(team.selectedNation);
          const teamSlots = slotByUserAndOrder.get(team.userId);

          return (
            <section
              key={team.userId}
              className="rounded-2xl bg-white/95 p-4 shadow-md ring-1 ring-black/5"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-[#081120]/8 pb-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#081120]">{team.username}</p>
                  <p className="text-sm text-[#081120]/60">{team.teamName}</p>
                  <p className="mt-1 text-xs text-[#081120]/50">
                    <span className="font-semibold">{nationTheme.abbr}</span> ·{" "}
                    {team.selectedNation}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0066FF]/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#0066FF]/70">
                    Points
                  </p>
                  <p className="text-lg font-black tabular-nums text-[#0066FF]">
                    {team.totalPoints}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.label}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#081120]/45">
                      {group.label}
                    </h3>
                    <ul className="space-y-2">
                      {group.slots.map((slotDef) => {
                        const slot = teamSlots?.get(slotDef.slotOrder);
                        const player = slot?.player ?? null;

                        return (
                          <li key={slotDef.slotOrder}>
                            {player ? (
                              <div className="flex items-center gap-3 rounded-xl bg-[#081120]/5 px-3 py-2">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                  <PlayerAvatar
                                    name={player.name}
                                    photoUrl={player.photoUrl}
                                    className="h-10 w-10"
                                    initialsClassName="h-10 w-10 text-[10px]"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-[#081120]">
                                    {player.name}
                                  </p>
                                  <p className="text-xs text-[#081120]/50">
                                    {getPositionLabel(player.position)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={pending}
                                  className="shrink-0 text-[#E53935]"
                                  onClick={() =>
                                    handleRemove(team.userId, slotDef.slotOrder)
                                  }
                                  aria-label={`Remove ${player.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  setPicker({
                                    userId: team.userId,
                                    teamName: team.teamName,
                                    slotOrder: slotDef.slotOrder,
                                    position: slotDef.position,
                                  })
                                }
                                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-dashed border-[#0066FF]/35 bg-[#0066FF]/5 text-sm font-semibold text-[#0066FF] active:scale-[0.98] disabled:opacity-50"
                              >
                                Add Player
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {picker && (
        <OwnerPlayerAssignModal
          open={!!picker}
          onClose={() => setPicker(null)}
          slotPosition={picker.position}
          teamName={picker.teamName}
          players={pickerPlayers}
          onSelect={handleAssign}
        />
      )}
    </>
  );
}
