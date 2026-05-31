"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type FormationId,
  getFormation,
  buildAllSlots,
  buildStarterSlots,
} from "@/lib/squad/formations";
import {
  type FantasyPlayer,
  validateSquad,
  computeTeamStrength,
} from "@/lib/squad/squad-utils";
import {
  buildPlayersMap,
  getInitialAssignments,
} from "@/lib/mock/available-players";

export function useSquadManager() {
  const [formationId, setFormationId] = useState<FormationId>("4-3-3");
  const [players] = useState<Record<string, FantasyPlayer>>(buildPlayersMap);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() =>
    getInitialAssignments(4, 3, 3)
  );
  const [captainId, setCaptainId] = useState<string | null>("4");
  const [viceCaptainId, setViceCaptainId] = useState<string | null>("5");
  const [benchOpen, setBenchOpen] = useState(false);
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [detailPlayerId, setDetailPlayerId] = useState<string | null>(null);

  const formation = getFormation(formationId);
  const slots = useMemo(() => buildAllSlots(formation), [formation]);
  const validation = useMemo(
    () => validateSquad(assignments, players),
    [assignments, players]
  );
  const strength = useMemo(
    () => computeTeamStrength(players, assignments),
    [players, assignments]
  );

  const changeFormation = useCallback(
    (id: FormationId) => {
      const next = getFormation(id);
      const prevStarters = buildStarterSlots(getFormation(formationId));
      const nextStarters = buildStarterSlots(next);

      setAssignments((prev) => {
        const nextAssignments: Record<string, string | null> = { ...prev };

        const byPosition: Record<string, string[]> = { GK: [], DEF: [], MID: [], FWD: [] };
        for (const slot of prevStarters) {
          const pid = prev[slot.id];
          if (pid) byPosition[slot.position].push(pid);
        }

        for (const slot of nextStarters) {
          nextAssignments[slot.id] = byPosition[slot.position].shift() ?? null;
        }

        for (const slot of prevStarters) {
          if (!nextStarters.find((s) => s.id === slot.id)) {
            delete nextAssignments[slot.id];
          }
        }

        return nextAssignments;
      });
      setFormationId(id);
    },
    [formationId]
  );

  const assignPlayer = useCallback((slotId: string, playerId: string) => {
    setAssignments((prev) => {
      const next = { ...prev };
      const existingSlot = Object.entries(next).find(([, id]) => id === playerId)?.[0];
      const currentInSlot = next[slotId];
      if (existingSlot) next[existingSlot] = currentInSlot;
      next[slotId] = playerId;
      return next;
    });
    setPickerSlotId(null);
  }, []);

  const removePlayer = useCallback((slotId: string) => {
    setAssignments((prev) => ({ ...prev, [slotId]: null }));
    setDetailPlayerId(null);
  }, []);

  const swapSlots = useCallback((slotA: string, slotB: string) => {
    setAssignments((prev) => {
      const a = prev[slotA];
      const b = prev[slotB];
      return { ...prev, [slotA]: b ?? null, [slotB]: a ?? null };
    });
  }, []);

  const setCaptain = useCallback((playerId: string) => {
    setCaptainId(playerId);
    if (viceCaptainId === playerId) setViceCaptainId(null);
  }, [viceCaptainId]);

  const setViceCaptain = useCallback((playerId: string) => {
    setViceCaptainId(playerId);
    if (captainId === playerId) setCaptainId(null);
  }, [captainId]);

  const getSlotPlayer = useCallback(
    (slotId: string) => {
      const pid = assignments[slotId];
      return pid ? players[pid] : null;
    },
    [assignments, players]
  );

  const getAssignedPlayerIds = useCallback(
    () => new Set(Object.values(assignments).filter(Boolean) as string[]),
    [assignments]
  );

  return {
    formationId,
    formation,
    slots,
    assignments,
    players,
    captainId,
    viceCaptainId,
    benchOpen,
    setBenchOpen,
    pickerSlotId,
    setPickerSlotId,
    detailPlayerId,
    setDetailPlayerId,
    validation,
    strength,
    changeFormation,
    assignPlayer,
    removePlayer,
    swapSlots,
    setCaptain,
    setViceCaptain,
    getSlotPlayer,
    getAssignedPlayerIds,
  };
}

export type SquadManager = ReturnType<typeof useSquadManager>;
