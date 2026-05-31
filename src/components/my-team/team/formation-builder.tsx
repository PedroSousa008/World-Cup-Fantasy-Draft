"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { getNationFlag } from "@/lib/mock/my-team-data";
import { useSquadManager } from "@/hooks/use-squad-manager";
import { FormationSelector, TeamSummaryCard, SquadValidationBanner, TeamStrengthSection } from "@/components/my-team/team/team-summary";
import { FormationPitch } from "@/components/my-team/team/formation-pitch";
import { BenchPanel } from "@/components/my-team/team/bench-panel";
import { PlayerPickerDrawer } from "@/components/my-team/team/player-picker-drawer";
import { PlayerDetailSheet } from "@/components/my-team/team/player-detail-sheet";

interface FormationBuilderProps {
  teamName: string;
  selectedNation: string;
}

export function FormationBuilder({ teamName, selectedNation }: FormationBuilderProps) {
  const squad = useSquadManager();
  const [detailSlotId, setDetailSlotId] = useState<string | null>(null);

  const pickerAssignedIds = (() => {
    const ids = squad.getAssignedPlayerIds();
    if (squad.pickerSlotId) {
      const current = squad.assignments[squad.pickerSlotId];
      if (current) ids.delete(current);
    }
    return ids;
  })();

  const starterSlots = squad.slots.filter((s) => s.zone === "starter");
  const benchSlots = squad.slots.filter((s) => s.zone === "bench");

  const pickerSlot = squad.pickerSlotId
    ? squad.slots.find((s) => s.id === squad.pickerSlotId) ?? null
    : null;

  const detailPlayer = detailSlotId
    ? squad.getSlotPlayer(detailSlotId)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const fromSlot = active.data.current?.slotId as string | undefined;
      const toSlot = over.id as string;
      if (fromSlot && fromSlot !== toSlot) {
        squad.swapSlots(fromSlot, toSlot);
      }
    },
    [squad]
  );

  const allAvailable = Object.values(squad.players);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4 pb-6">
        <TeamSummaryCard
          teamName={teamName}
          nation={selectedNation}
          nationFlag={getNationFlag(selectedNation)}
          totalPoints={squad.strength.totalPoints}
          formation={squad.formationId}
          playersSelected={squad.validation.totalSelected}
          totalSlots={18}
        />

        <SquadValidationBanner warnings={squad.validation.warnings} />

        <FormationSelector value={squad.formationId} onChange={squad.changeFormation} />

        <FormationPitch
          starterSlots={starterSlots}
          getPlayer={squad.getSlotPlayer}
          captainId={squad.captainId}
          viceCaptainId={squad.viceCaptainId}
          onEmptyClick={(slotId) => squad.setPickerSlotId(slotId)}
          onPlayerClick={(slotId, playerId) => {
            setDetailSlotId(slotId);
            squad.setDetailPlayerId(playerId);
          }}
        />

        <BenchPanel
          open={squad.benchOpen}
          onToggle={() => squad.setBenchOpen(!squad.benchOpen)}
          benchSlots={benchSlots}
          getPlayer={squad.getSlotPlayer}
          captainId={squad.captainId}
          viceCaptainId={squad.viceCaptainId}
          onEmptyClick={(slotId) => squad.setPickerSlotId(slotId)}
          onPlayerClick={(slotId, playerId) => {
            setDetailSlotId(slotId);
            squad.setDetailPlayerId(playerId);
          }}
        />

        <TeamStrengthSection
          projection={squad.strength.projection}
          diversity={squad.strength.diversity}
          strength={squad.strength.strength}
        />
      </div>

      <PlayerPickerDrawer
        open={!!squad.pickerSlotId}
        onClose={() => squad.setPickerSlotId(null)}
        slot={pickerSlot}
        players={allAvailable}
        assignedIds={pickerAssignedIds}
        onSelect={(playerId) => {
          if (squad.pickerSlotId) squad.assignPlayer(squad.pickerSlotId, playerId);
        }}
        onViewProfile={(playerId) => {
          squad.setPickerSlotId(null);
          squad.setDetailPlayerId(playerId);
          setDetailSlotId(
            Object.entries(squad.assignments).find(([, id]) => id === playerId)?.[0] ?? null
          );
        }}
      />

      <PlayerDetailSheet
        player={detailPlayer}
        open={!!squad.detailPlayerId && !!detailPlayer}
        onClose={() => {
          squad.setDetailPlayerId(null);
          setDetailSlotId(null);
        }}
        isCaptain={detailPlayer?.id === squad.captainId}
        isViceCaptain={detailPlayer?.id === squad.viceCaptainId}
        onReplace={() => {
          if (detailSlotId) {
            squad.setPickerSlotId(detailSlotId);
            squad.setDetailPlayerId(null);
          }
        }}
        onMakeCaptain={() => detailPlayer && squad.setCaptain(detailPlayer.id)}
        onMakeViceCaptain={() => detailPlayer && squad.setViceCaptain(detailPlayer.id)}
        onRemove={() => detailSlotId && squad.removePlayer(detailSlotId)}
      />

      <DragOverlay />
    </DndContext>
  );
}
