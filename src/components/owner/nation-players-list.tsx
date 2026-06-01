"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayerAvatar } from "@/components/player/player-avatar";
import {
  assignPlayerToUserAction,
  deletePlayerAction,
  unassignPlayerAction,
  uploadPlayerPhotoAction,
} from "@/lib/actions/owner/players";
import { getPositionLabel } from "@/lib/players/types";
import { Button } from "@/components/ui/button";

interface NationPlayersListProps {
  players: {
    id: string;
    name: string;
    position: string;
    photoUrl: string | null;
    ownerTeamName: string | null;
    isAssigned: boolean;
  }[];
  users: { id: string; teamName: string }[];
}

export function NationPlayersList({ players, users }: NationPlayersListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (players.length === 0) {
    return (
      <p className="rounded-2xl bg-white/95 p-6 text-center text-sm text-[#081120]/50">
        No players for this nation yet. Create the first player above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li
          key={player.id}
          className="rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <PlayerAvatar
                name={player.name}
                photoUrl={player.photoUrl}
                className="h-12 w-12"
                initialsClassName="h-12 w-12 text-xs"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#081120]">{player.name}</p>
              <p className="text-xs text-[#081120]/50">
                {getPositionLabel(player.position)}
                {player.isAssigned
                  ? ` · Assigned to ${player.ownerTeamName}`
                  : " · Unassigned (in Redraft)"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <span className="inline-flex h-9 items-center rounded-lg bg-[#081120]/5 px-3 text-xs font-semibold text-[#081120]">
                Upload photo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={pending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.set("playerId", player.id);
                  fd.set("file", file);
                  startTransition(() => {
                    void uploadPlayerPhotoAction(fd).then(() => router.refresh());
                  });
                }}
              />
            </label>

            {!player.isAssigned && users.length > 0 && (
              <select
                className="h-9 rounded-lg border border-[#081120]/10 px-2 text-xs"
                defaultValue=""
                disabled={pending}
                onChange={(e) => {
                  const userId = e.target.value;
                  if (!userId) return;
                  startTransition(() => {
                    void assignPlayerToUserAction({
                      playerId: player.id,
                      userId,
                    }).then(() => router.refresh());
                  });
                }}
              >
                <option value="">Assign to…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.teamName}
                  </option>
                ))}
              </select>
            )}

            {player.isAssigned && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(() => {
                    void unassignPlayerAction(player.id).then(() => router.refresh());
                  });
                }}
              >
                Unassign
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={pending || player.isAssigned}
              className="text-[#E53935]"
              onClick={() => {
                if (!confirm(`Delete ${player.name}?`)) return;
                startTransition(() => {
                  void deletePlayerAction(player.id).then(() => router.refresh());
                });
              }}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
