"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSquad } from "@/contexts/squad-context";
import { PlayerDetailView } from "@/components/my-team/team/player-detail-view";
import type { DbPlayerDetails } from "@/lib/rankings/get-player-details";

interface PlayerPageClientProps {
  playerId: string;
  dbPlayer: DbPlayerDetails;
}

export function PlayerPageClient({ playerId, dbPlayer }: PlayerPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slot");
  const fromRankings = searchParams.get("from") === "rankings";
  const squad = useSquad();

  const squadPlayer = squad.players[playerId] ?? null;
  const player = squadPlayer ?? dbPlayer;

  const slot = slotId ? squad.slots.find((s) => s.id === slotId) ?? null : null;
  const isInSquad = !!(slot && squadPlayer && squad.assignments[slot.id] === playerId);

  const backHref = fromRankings
    ? "/my-team/rankings"
    : isInSquad
      ? "/my-team/team"
      : "/my-team/rankings";

  if (!isInSquad) {
    return (
      <PlayerDetailView
        player={player}
        slot={{ id: "readonly", position: player.position, zone: "starter", index: 0 }}
        isCaptain={false}
        isViceCaptain={false}
        substitutionTargets={[]}
        readOnly
        backHref={backHref}
        ownerTeamName={dbPlayer.ownerTeamName}
        minutesPlayed={dbPlayer.minutesPlayed}
        ownGoals={dbPlayer.ownGoals}
        onMakeCaptain={() => {}}
        onMakeViceCaptain={() => {}}
        onRemove={() => router.push(backHref)}
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
      backHref={backHref}
      minutesPlayed={dbPlayer.minutesPlayed}
      ownGoals={dbPlayer.ownGoals}
      ownerTeamName={dbPlayer.ownerTeamName}
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
