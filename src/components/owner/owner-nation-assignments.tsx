"use client";

import { NationPlayersList } from "@/components/owner/nation-players-list";
import { FileBasedPlayerGuide } from "@/components/owner/file-based-player-guide";

interface OwnerNationAssignmentsProps {
  nationSlug: string;
  nationName: string;
  players: {
    id: string;
    name: string;
    position: string;
    photoUrl: string | null;
    positionLocked: boolean;
    ownerTeamName: string | null;
    isAssigned: boolean;
  }[];
  users: { id: string; teamName: string }[];
}

export function OwnerNationAssignments({
  nationSlug,
  nationName,
  players,
  users,
}: OwnerNationAssignmentsProps) {
  return (
    <div className="space-y-6">
      <FileBasedPlayerGuide nationSlug={nationSlug} nationName={nationName} />

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/45">
          Assignments
        </h3>
        <p className="mb-3 text-sm text-white/50">
          Assign registered players to user teams. Unassigned players stay in Redraft.
        </p>

        {players.length === 0 ? (
          <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
            <p className="font-semibold text-[#081120]/70">No players added yet.</p>
            <p className="mt-1 text-sm text-[#081120]/45">
              Add an image to <code className="rounded bg-[#081120]/5 px-1">players/{nationSlug}/</code>{" "}
              and register with the command above.
            </p>
          </div>
        ) : (
          <NationPlayersList players={players} users={users} />
        )}
      </div>
    </div>
  );
}
