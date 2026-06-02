"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { SquadInitialData } from "@/lib/squad/get-squad-data";
import { FORMATION_STORAGE_KEY } from "@/lib/squad/slot-keys";
import { saveSquadLineupAction } from "@/lib/actions/squad";
import { getEmptyAssignments } from "@/lib/squad/empty-assignments";

function buildPlayersMap(assignedPlayers: FantasyPlayer[]): Record<string, FantasyPlayer> {
  const map: Record<string, FantasyPlayer> = {};
  for (const p of assignedPlayers) map[p.id] = p;
  return map;
}

function readStoredFormation(fallback: FormationId): FormationId {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(FORMATION_STORAGE_KEY);
    if (raw && ["3-4-3", "3-5-2", "4-3-3", "4-4-2", "4-5-1", "5-3-2", "5-4-1"].includes(raw)) {
      return raw as FormationId;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export function useSquadManager(initial: SquadInitialData) {
  const assignedPool = initial.assignedPlayers;

  const [formationId, setFormationId] = useState<FormationId>(() =>
    readStoredFormation(initial.formationId)
  );
  const [players, setPlayers] = useState<Record<string, FantasyPlayer>>(() =>
    buildPlayersMap(assignedPool)
  );
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() => {
    const fid = readStoredFormation(initial.formationId);
    const base = getEmptyAssignments(fid);
    return { ...base, ...initial.assignments };
  });
  const [captainId, setCaptainId] = useState<string | null>(initial.captainId);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(initial.viceCaptainId);
  const [benchOpen, setBenchOpen] = useState(false);
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPlayers(buildPlayersMap(assignedPool));
    const validIds = new Set(assignedPool.map((p) => p.id));
    setAssignments((prev) => {
      const next: Record<string, string | null> = { ...prev };
      for (const [slotId, pid] of Object.entries(next)) {
        if (pid && !validIds.has(pid)) next[slotId] = null;
      }
      return next;
    });
    setCaptainId((c) => (c && validIds.has(c) ? c : null));
    setViceCaptainId((v) => (v && validIds.has(v) ? v : null));
  }, [assignedPool]);

  const persistLineup = useCallback(
    (
      nextAssignments: Record<string, string | null>,
      nextCaptain: string | null,
      nextVice: string | null,
      nextFormation: FormationId
    ) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveSquadLineupAction({
          formationId: nextFormation,
          assignments: nextAssignments,
          captainId: nextCaptain,
          viceCaptainId: nextVice,
        }).then((res) => {
          if (!res.ok) setSaveError(res.error);
          else setSaveError(null);
        });
      }, 400);
    },
    []
  );

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

        for (const slot of buildAllSlots(next)) {
          if (!(slot.id in nextAssignments)) nextAssignments[slot.id] = null;
        }

        persistLineup(nextAssignments, captainId, viceCaptainId, id);
        return nextAssignments;
      });
      setFormationId(id);
      try {
        localStorage.setItem(FORMATION_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
    },
    [formationId, captainId, viceCaptainId, persistLineup]
  );

  const assignPlayer = useCallback(
    (slotId: string, playerId: string) => {
      setAssignments((prev) => {
        const next = { ...prev };
        const existingSlot = Object.entries(next).find(([, id]) => id === playerId)?.[0];
        const currentInSlot = next[slotId];
        if (existingSlot) next[existingSlot] = currentInSlot;
        next[slotId] = playerId;
        persistLineup(next, captainId, viceCaptainId, formationId);
        return next;
      });
      setPickerSlotId(null);
    },
    [captainId, viceCaptainId, formationId, persistLineup]
  );

  const removePlayer = useCallback(
    (slotId: string) => {
      const removedId = assignments[slotId];
      const next = { ...assignments, [slotId]: null };
      const cap = removedId && captainId === removedId ? null : captainId;
      const vice = removedId && viceCaptainId === removedId ? null : viceCaptainId;
      setAssignments(next);
      setCaptainId(cap);
      setViceCaptainId(vice);
      persistLineup(next, cap, vice, formationId);
    },
    [assignments, captainId, viceCaptainId, formationId, persistLineup]
  );

  const substitutePlayers = useCallback(
    (fromSlotId: string, toSlotId: string) => {
      setAssignments((prev) => {
        const fromPlayer = prev[fromSlotId];
        const toPlayer = prev[toSlotId];
        const next = { ...prev, [fromSlotId]: toPlayer ?? null, [toSlotId]: fromPlayer ?? null };
        persistLineup(next, captainId, viceCaptainId, formationId);
        return next;
      });
    },
    [captainId, viceCaptainId, formationId, persistLineup]
  );

  const setCaptain = useCallback(
    (playerId: string) => {
      setCaptainId(playerId);
      if (viceCaptainId === playerId) setViceCaptainId(null);
      persistLineup(
        assignments,
        playerId,
        viceCaptainId === playerId ? null : viceCaptainId,
        formationId
      );
    },
    [assignments, viceCaptainId, formationId, persistLineup]
  );

  const setViceCaptain = useCallback(
    (playerId: string) => {
      setViceCaptainId(playerId);
      if (captainId === playerId) setCaptainId(null);
      persistLineup(
        assignments,
        captainId === playerId ? null : captainId,
        playerId,
        formationId
      );
    },
    [assignments, captainId, formationId, persistLineup]
  );

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
    saveError,
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
