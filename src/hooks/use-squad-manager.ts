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
  computeSquadPoints,
} from "@/lib/squad/squad-utils";
import {
  buildPlayersMap,
  getEmptyAssignments,
  getOwnerAssignedPlayers,
} from "@/lib/mock/available-players";

export function useSquadManager(teamName: string) {
  const assignedPool = useMemo(() => getOwnerAssignedPlayers(teamName), [teamName]);

  const [formationId, setFormationId] = useState<FormationId>("4-3-3");
  const [players] = useState<Record<string, FantasyPlayer>>(() => buildPlayersMap(assignedPool));
  const [assignments, setAssignments] = useState<Record<string, string | null>>(getEmptyAssignments);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);
  const [benchOpen, setBenchOpen] = useState(false);
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);

  const formation = getFormation(formationId);
  const slots = useMemo(() => buildAllSlots(formation), [formation]);
  const validation = useMemo(
    () => validateSquad(assignments, players),
    [assignments, players]
  );
  const totalPoints = useMemo(
    () => computeSquadPoints(players, assignments),
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
    setAssignments((prev) => {
      const removedId = prev[slotId];
      if (removedId) {
        setCaptainId((c) => (c === removedId ? null : c));
        setViceCaptainId((v) => (v === removedId ? null : v));
      }
      return { ...prev, [slotId]: null };
    });
  }, []);

  const substitutePlayers = useCallback((fromSlotId: string, toSlotId: string) => {
    setAssignments((prev) => {
      const fromPlayer = prev[fromSlotId];
      const toPlayer = prev[toSlotId];
      return { ...prev, [fromSlotId]: toPlayer ?? null, [toSlotId]: fromPlayer ?? null };
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
      return pid ? players[pid] ?? null : null;
    },
    [assignments, players]
  );

  const getAssignedPlayerIds = useCallback(
    () => new Set(Object.values(assignments).filter(Boolean) as string[]),
    [assignments]
  );

  const getSubstitutionTargets = useCallback(
    (slotId: string) => {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return [];

      const player = getSlotPlayer(slotId);
      if (!player) return [];

      const position = player.position;
      const oppositeZone = slot.zone === "starter" ? "bench" : "starter";

      return slots
        .filter((s) => s.zone === oppositeZone)
        .map((s) => ({
          slot: s,
          player: getSlotPlayer(s.id),
        }))
        .filter(
          (t): t is { slot: (typeof slots)[0]; player: FantasyPlayer } =>
            t.player !== null && t.player.position === position
        );
    },
    [slots, getSlotPlayer]
  );

  const availableForSlot = useCallback(
    (slotId: string) => {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return [];

      const assignedIds = getAssignedPlayerIds();

      if (slot.zone === "bench") {
        return assignedPool.filter((p) => !assignedIds.has(p.id));
      }

      return assignedPool.filter(
        (p) => p.position === slot.position && !assignedIds.has(p.id)
      );
    },
    [slots, assignedPool, getAssignedPlayerIds]
  );

  return {
    formationId,
    formation,
    slots,
    assignments,
    players,
    assignedPool,
    captainId,
    viceCaptainId,
    benchOpen,
    setBenchOpen,
    pickerSlotId,
    setPickerSlotId,
    validation,
    totalPoints,
    changeFormation,
    assignPlayer,
    removePlayer,
    substitutePlayers,
    setCaptain,
    setViceCaptain,
    getSlotPlayer,
    getAssignedPlayerIds,
    getSubstitutionTargets,
    availableForSlot,
  };
}

export type SquadManager = ReturnType<typeof useSquadManager>;
