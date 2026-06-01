"use client";

import { useSquad } from "@/contexts/squad-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormationSelector, TeamSummaryCard } from "@/components/my-team/team/team-summary";
import { FormationPitch } from "@/components/my-team/team/formation-pitch";
import { BenchPanel } from "@/components/my-team/team/bench-panel";
import { PlayerPickerDrawer } from "@/components/my-team/team/player-picker-drawer";
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
  const [pickerFocusSearch, setPickerFocusSearch] = useState(false);

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

  const openSlotActions = (slotId: string) => setActionSlotId(slotId);

  const openPicker = (slotId: string, focusSearch = false) => {
    setPickerFocusSearch(focusSearch);
    squad.setPickerSlotId(slotId);
  };

  return (
    <div className="space-y-4 pb-6 overflow-x-hidden">
      <TeamSummaryCard
        teamName={teamName}
        nation={selectedNation}
        nationFlag={getNationFlag(selectedNation)}
        totalPoints={squad.totalPoints}
        formation={squad.formationId}
        playersSelected={squad.validation.totalSelected}
        totalSlots={18}
      />

      <FormationSelector value={squad.formationId} onChange={squad.changeFormation} />

      <FormationPitch
        starterSlots={starterSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        viceCaptainId={squad.viceCaptainId}
        onEmptyClick={openSlotActions}
        onPlayerClick={openSlotActions}
      />

      <BenchPanel
        open={squad.benchOpen}
        onToggle={() => squad.setBenchOpen(!squad.benchOpen)}
        benchSlots={benchSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        onEmptyClick={openSlotActions}
        onPlayerClick={openSlotActions}
      />

      <SlotActionSheet
        open={!!actionSlotId}
        onClose={() => setActionSlotId(null)}
        slot={actionSlot}
        player={actionPlayer}
        isCaptain={actionPlayer?.id === squad.captainId}
        isViceCaptain={actionPlayer?.id === squad.viceCaptainId}
        substitutionTargets={actionSlotId ? squad.getSubstitutionTargets(actionSlotId) : []}
        onAddPlayer={() => actionSlotId && openPicker(actionSlotId)}
        onSearchPlayer={() => actionSlotId && openPicker(actionSlotId, true)}
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

      <PlayerPickerDrawer
        open={!!squad.pickerSlotId}
        onClose={() => {
          squad.setPickerSlotId(null);
          setPickerFocusSearch(false);
        }}
        slot={pickerSlot}
        players={pickerPlayers}
        autoFocusSearch={pickerFocusSearch}
        onSelect={(playerId) => {
          if (squad.pickerSlotId) squad.assignPlayer(squad.pickerSlotId, playerId);
        }}
        onViewProfile={(playerId) => {
          const slotId = squad.pickerSlotId;
          squad.setPickerSlotId(null);
          setPickerFocusSearch(false);
          router.push(`/my-team/player/${playerId}?slot=${slotId ?? ""}`);
        }}
      />
    </div>
  );
}
