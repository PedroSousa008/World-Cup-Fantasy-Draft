"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSquad } from "@/contexts/squad-context";
import { PlayerDetailView } from "@/components/my-team/team/player-detail-view";
import { SHOWCASE_PLAYERS } from "@/lib/mock/showcase-players";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";

interface PlayerPageClientProps {
  playerId: string;
}

export function PlayerPageClient({ playerId }: PlayerPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slot");
  const squad = useSquad();

  const squadPlayer = squad.players[playerId] ?? null;
  const showcasePlayer = SHOWCASE_PLAYERS.find((p) => p.id === playerId) ?? null;
  const player: FantasyPlayer | null = squadPlayer ?? showcasePlayer;

  const slot = slotId ? squad.slots.find((s) => s.id === slotId) ?? null : null;
  const isInSquad = !!(slot && player && squad.assignments[slot.id] === playerId);

  if (!player) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#081120] px-4">
        <p className="text-sm text-white/50">Player not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!isInSquad) {
    return (
      <PlayerDetailView
        player={player}
        slot={{ id: "readonly", position: player.position, zone: "starter", index: 0 }}
        isCaptain={false}
        isViceCaptain={false}
        substitutionTargets={[]}
        readOnly
        backHref="/my-team/draft"
        onMakeCaptain={() => {}}
        onMakeViceCaptain={() => {}}
        onRemove={() => router.back()}
        onSubstitute={() => {}}
      />
    );
  }

  return (
    <PlayerDetailView
      player={player}
      slot={slot!}
      isCaptain={squad.captainId === player.id}
      isViceCaptain={squad.viceCaptainId === player.id}
      substitutionTargets={squad.getSubstitutionTargets(slot!.id)}
      onMakeCaptain={() => squad.setCaptain(player.id)}
      onMakeViceCaptain={() => squad.setViceCaptain(player.id)}
      onRemove={() => {
        squad.removePlayer(slot!.id);
        router.push("/my-team/team");
      }}
      onSubstitute={(targetSlotId) => squad.substitutePlayers(slot!.id, targetSlotId)}
    />
  );
}
