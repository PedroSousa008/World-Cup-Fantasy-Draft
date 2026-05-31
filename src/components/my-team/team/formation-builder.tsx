"use client";

import { useSquad } from "@/contexts/squad-context";
import { useRouter } from "next/navigation";
import { FormationSelector, TeamSummaryCard, SquadValidationBanner } from "@/components/my-team/team/team-summary";
import { FormationPitch } from "@/components/my-team/team/formation-pitch";
import { BenchPanel } from "@/components/my-team/team/bench-panel";
import { PlayerPickerDrawer } from "@/components/my-team/team/player-picker-drawer";
import { getNationFlag } from "@/lib/mock/my-team-data";

interface FormationBuilderProps {
  teamName: string;
  selectedNation: string;
}

export function FormationBuilder({ teamName, selectedNation }: FormationBuilderProps) {
  const router = useRouter();
  const squad = useSquad();

  const starterSlots = squad.slots.filter((s) => s.zone === "starter");
  const benchSlots = squad.slots.filter((s) => s.zone === "bench");

  const pickerSlot = squad.pickerSlotId
    ? squad.slots.find((s) => s.id === squad.pickerSlotId) ?? null
    : null;

  const pickerPlayers = squad.pickerSlotId
    ? squad.availableForSlot(squad.pickerSlotId)
    : [];

  const ownerPoolEmpty = squad.assignedPool.length === 0;

  return (
    <div className="space-y-4 pb-6">
      <TeamSummaryCard
        teamName={teamName}
        nation={selectedNation}
        nationFlag={getNationFlag(selectedNation)}
        totalPoints={squad.totalPoints}
        formation={squad.formationId}
        playersSelected={squad.validation.totalSelected}
        totalSlots={18}
      />

      {ownerPoolEmpty && (
        <div className="mx-4 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/8 px-4 py-3">
          <p className="text-xs font-semibold text-[#FFD700]">
            Your squad is empty. The Owner will assign drafted players to your team after the draft completes.
          </p>
        </div>
      )}

      <SquadValidationBanner warnings={squad.validation.warnings} />

      <FormationSelector value={squad.formationId} onChange={squad.changeFormation} />

      <FormationPitch
        starterSlots={starterSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        viceCaptainId={squad.viceCaptainId}
        onEmptyClick={(slotId) => squad.setPickerSlotId(slotId)}
        onPlayerClick={(slotId, playerId) => {
          router.push(`/my-team/player/${playerId}?slot=${slotId}`);
        }}
      />

      <BenchPanel
        open={squad.benchOpen}
        onToggle={() => squad.setBenchOpen(!squad.benchOpen)}
        benchSlots={benchSlots}
        getPlayer={squad.getSlotPlayer}
        captainId={squad.captainId}
        onEmptyClick={(slotId) => squad.setPickerSlotId(slotId)}
        onPlayerClick={(slotId, playerId) => {
          router.push(`/my-team/player/${playerId}?slot=${slotId}`);
        }}
      />

      <PlayerPickerDrawer
        open={!!squad.pickerSlotId}
        onClose={() => squad.setPickerSlotId(null)}
        slot={pickerSlot}
        players={pickerPlayers}
        ownerPoolEmpty={ownerPoolEmpty}
        onSelect={(playerId) => {
          if (squad.pickerSlotId) squad.assignPlayer(squad.pickerSlotId, playerId);
        }}
        onViewProfile={(playerId) => {
          squad.setPickerSlotId(null);
          router.push(`/my-team/player/${playerId}?slot=${squad.pickerSlotId ?? ""}`);
        }}
      />
    </div>
  );
}
