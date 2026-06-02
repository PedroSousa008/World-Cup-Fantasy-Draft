"use client";

import { useSquad } from "@/contexts/squad-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormationSelector, TeamSummaryCard } from "@/components/my-team/team/team-summary";
import { FormationPitch } from "@/components/my-team/team/formation-pitch";
import { BenchPanel } from "@/components/my-team/team/bench-panel";
import { AssignedPlayerPicker } from "@/components/my-team/team/assigned-player-picker";
import { SlotActionSheet } from "@/components/my-team/team/slot-action-sheet";
import { getNationFlag } from "@/lib/mock/my-team-data";

interface FormationBuilderProps {
  teamName: string;
  selectedNation: string;
}

export function FormationBuilder({ teamName, selectedNation }: FormationBuilderProps) {
  const router = useRouter();
  const squad = useSquad();
  const [actionSlotId, setActionSlotId] = useState<string | null>(null);

  const starterSlots = squad.slots.filter((s) => s.zone === "starter");
  const benchSlots = squad.slots.filter((s) => s.zone === "bench");

  const actionSlot = actionSlotId
    ? squad.slots.find((s) => s.id === actionSlotId) ?? null
    : null;
  const actionPlayer = actionSlotId ? squad.getSlotPlayer(actionSlotId) : null;

  const pickerSlot = squad.pickerSlotId
    ? squad.slots.find((s) => s.id === squad.pickerSlotId) ?? null
    : null;

  const pickerPlayers = squad.pickerSlotId
    ? squad.availableForSlot(squad.pickerSlotId)
    : [];

  const handleSlotClick = (slotId: string) => {
    const player = squad.getSlotPlayer(slotId);
    if (!player) {
      squad.setPickerSlotId(slotId);
      return;
    }
    setActionSlotId(slotId);
  };

  return (
    <div className="space-y-4 overflow-x-hidden pb-8">
      <TeamSummaryCard
        teamName={teamName}
        nation={selectedNation}
        nationFlag={getNationFlag(selectedNation)}
        totalPoints={squad.totalPoints}
        formation={squad.formationId}
        playersSelected={squad.validation.totalSelected}
        totalSlots={18}
      />

      {squad.saveError && (
        <p className="rounded-xl bg-[#E53935]/15 px-4 py-2 text-sm font-semibold text-[#E53935]">
          {squad.saveError}
        </p>
      )}

      <FormationSelector value={squad.formationId} onChange={squad.changeFormation} />

      <FormationPitch
        starterSlots={starterSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        viceCaptainId={squad.viceCaptainId}
        onEmptyClick={handleSlotClick}
        onPlayerClick={handleSlotClick}
      />

      <BenchPanel
        open={squad.benchOpen}
        onToggle={() => squad.setBenchOpen(!squad.benchOpen)}
        benchSlots={benchSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        onEmptyClick={handleSlotClick}
        onPlayerClick={handleSlotClick}
      />

      <SlotActionSheet
        open={!!actionSlotId && !!actionPlayer}
        onClose={() => setActionSlotId(null)}
        slot={actionSlot}
        player={actionPlayer}
        isCaptain={actionPlayer?.id === squad.captainId}
        isViceCaptain={actionPlayer?.id === squad.viceCaptainId}
        substitutionTargets={actionSlotId ? squad.getSubstitutionTargets(actionSlotId) : []}
        onViewProfile={() => {
          if (actionPlayer && actionSlotId) {
            router.push(`/my-team/player/${actionPlayer.id}?slot=${actionSlotId}`);
          }
        }}
        onSubstitution={(targetSlotId) => {
          if (actionSlotId) squad.substitutePlayers(actionSlotId, targetSlotId);
        }}
        onMakeCaptain={() => actionPlayer && squad.setCaptain(actionPlayer.id)}
        onMakeViceCaptain={() => actionPlayer && squad.setViceCaptain(actionPlayer.id)}
        onRemove={() => actionSlotId && squad.removePlayer(actionSlotId)}
      />

      <AssignedPlayerPicker
        open={!!squad.pickerSlotId}
        onClose={() => squad.setPickerSlotId(null)}
        slot={pickerSlot}
        players={pickerPlayers}
        onSelect={(playerId) => {
          if (squad.pickerSlotId) squad.assignPlayer(squad.pickerSlotId, playerId);
        }}
      />
    </div>
  );
}
