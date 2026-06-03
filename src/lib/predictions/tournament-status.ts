import { MatchStage, MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isManualSlot } from "@/lib/tournament/knockout/topology";
import { getKnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";

export interface GroupStageStatus {
  totalMatches: number;
  finishedMatches: number;
  isComplete: boolean;
}

export async function getGroupStageStatus(): Promise<GroupStageStatus> {
  const matches = await prisma.match.findMany({
    where: { stage: MatchStage.GROUP },
    select: { status: true, homeScore: true, awayScore: true },
  });

  const finishedMatches = matches.filter(
    (m) => m.status === MatchStatus.FINISHED && m.homeScore != null && m.awayScore != null
  ).length;

  return {
    totalMatches: matches.length,
    finishedMatches,
    isComplete: matches.length > 0 && finishedMatches === matches.length,
  };
}

export async function isKnockoutBracketReady(): Promise<boolean> {
  const data = await getKnockoutBracketData();
  const r32Slots = data.slots.filter((s) => isManualSlot(s.slotKey));
  return r32Slots.length > 0 && r32Slots.every((s) => s.nationalTeamId != null);
}

export async function isKnockoutStagesUnlocked(): Promise<boolean> {
  const [groupStatus, bracketReady] = await Promise.all([
    getGroupStageStatus(),
    isKnockoutBracketReady(),
  ]);
  return groupStatus.isComplete && bracketReady;
}

export interface KnockoutUnlockState {
  unlocked: boolean;
  groupStageComplete: boolean;
  bracketReady: boolean;
}

export async function getKnockoutUnlockState(): Promise<KnockoutUnlockState> {
  const [groupStatus, bracketReady] = await Promise.all([
    getGroupStageStatus(),
    isKnockoutBracketReady(),
  ]);
  return {
    unlocked: groupStatus.isComplete && bracketReady,
    groupStageComplete: groupStatus.isComplete,
    bracketReady,
  };
}
