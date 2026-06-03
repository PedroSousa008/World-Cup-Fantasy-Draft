"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";
import {
  getParticipationTeams,
  type ParticipationTeam,
} from "@/lib/scoring/match-participation";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";

const EVENT_TYPES = new Set<string>([
  SCORING_EVENT_TYPES.GOAL,
  SCORING_EVENT_TYPES.ASSIST,
  SCORING_EVENT_TYPES.YELLOW_CARD,
  SCORING_EVENT_TYPES.RED_CARD,
  SCORING_EVENT_TYPES.OWN_GOAL,
  SCORING_EVENT_TYPES.PENALTY_MISS,
  SCORING_EVENT_TYPES.PENALTY_SAVE,
]);

const matchEventSchema = z.object({
  playerId: z.string().min(1),
  eventType: z.string(),
  minute: z.number().int().min(0).max(130).nullable().optional(),
});

const saveMatchSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]),
  manOfTheMatchId: z.string().nullable().optional(),
  bettingOpen: z.boolean().optional(),
  events: z.array(matchEventSchema),
});

function revalidateTournament() {
  revalidatePath("/calendar");
  revalidatePath("/calendar/calendar");
  revalidatePath("/calendar/games");
  revalidatePath("/calendar/table");
  revalidatePath("/calendar/table/group-stage");
  revalidatePath("/calendar/table/knockout-stage");
  revalidatePath("/owner/matches");
  revalidatePath("/owner/matches-events");
  revalidatePath("/owner/matches-events/matches");
  revalidatePath("/owner/matches-events/events/group-stage");
  revalidatePath("/my-team");
  revalidatePath("/bets");
  revalidatePath("/predictions");
}

export type SaveMatchResultData = {
  participationRequired: ParticipationTeam[] | null;
  participantIds: string[];
};

export async function saveMatchResultAction(
  input: z.infer<typeof saveMatchSchema>
): Promise<OwnerActionResult<SaveMatchResultData>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const parsed = saveMatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid match data." };

  const { matchId, homeScore, awayScore, status, manOfTheMatchId, bettingOpen, events } =
    parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) return { ok: false, error: "Match not found." };

  const wasKnockout = Boolean(match.knockoutMatchKey);

  const teamIds = new Set([match.homeTeamId, match.awayTeamId]);
  for (const ev of events) {
    if (!EVENT_TYPES.has(ev.eventType)) {
      return { ok: false, error: `Unknown event type: ${ev.eventType}` };
    }
    const player = await prisma.player.findUnique({
      where: { id: ev.playerId },
      select: { nationalTeamId: true },
    });
    if (!player?.nationalTeamId || !teamIds.has(player.nationalTeamId)) {
      return { ok: false, error: "Player must belong to one of the match nations." };
    }
  }

  if (manOfTheMatchId) {
    const motm = await prisma.player.findUnique({
      where: { id: manOfTheMatchId },
      select: { nationalTeamId: true },
    });
    if (!motm?.nationalTeamId || !teamIds.has(motm.nationalTeamId)) {
      return { ok: false, error: "Man of the Match must be from a match nation." };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.matchEvent.deleteMany({ where: { matchId } });
    if (events.length > 0) {
      await tx.matchEvent.createMany({
        data: events.map((e) => ({
          matchId,
          playerId: e.playerId,
          eventType: e.eventType,
          minute: e.minute ?? null,
        })),
      });
    }
    await tx.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: status as MatchStatus,
        manOfTheMatchId: manOfTheMatchId ?? null,
        ...(bettingOpen !== undefined ? { bettingOpen } : {}),
      },
    });

    const participationRequired = getParticipationTeams(
      status,
      homeScore,
      awayScore,
      match.homeTeam,
      match.awayTeam
    );
    if (participationRequired) {
      await tx.matchParticipant.deleteMany({ where: { matchId } });
    }
  });

  if (wasKnockout) {
    const { onKnockoutMatchSaved } = await import(
      "@/lib/tournament/knockout/bracket-service"
    );
    await onKnockoutMatchSaved(matchId);
  }

  const { settleMatchPredictions } = await import(
    "@/lib/predictions/settle-match-predictions"
  );
  await settleMatchPredictions(matchId);

  revalidateTournament();

  const participationRequired = getParticipationTeams(
    status,
    homeScore,
    awayScore,
    match.homeTeam,
    match.awayTeam
  );

  return {
    ok: true,
    data: {
      participationRequired,
      participantIds: [],
    },
  };
}

const participationSchema = z.object({
  matchId: z.string().min(1),
  playerIds: z.array(z.string().min(1)),
});

export async function saveMatchParticipationAction(
  input: z.infer<typeof participationSchema>
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const parsed = participationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid participation data." };

  const { matchId, playerIds } = parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) return { ok: false, error: "Match not found." };
  if (match.status !== "FINISHED" || match.homeScore == null || match.awayScore == null) {
    return { ok: false, error: "Match must be finished before setting participation." };
  }

  const teams = getParticipationTeams(
    match.status,
    match.homeScore,
    match.awayScore,
    match.homeTeam,
    match.awayTeam
  );
  if (!teams) {
    return { ok: false, error: "This match does not require participation selection." };
  }

  const allowedTeamIds = new Set(teams.map((t) => t.teamId));
  for (const playerId of playerIds) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { nationalTeamId: true },
    });
    if (!player?.nationalTeamId || !allowedTeamIds.has(player.nationalTeamId)) {
      return { ok: false, error: "All selected players must be from the required team(s)." };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.matchParticipant.deleteMany({ where: { matchId } });
    if (playerIds.length > 0) {
      await tx.matchParticipant.createMany({
        data: playerIds.map((playerId) => ({ matchId, playerId })),
        skipDuplicates: true,
      });
    }
  });

  revalidateTournament();
  return { ok: true };
}

export async function resetMatchAction(matchId: string): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { ok: false, error: "Match not found." };

  const wasKnockout = Boolean(match.knockoutMatchKey);

  await prisma.$transaction(async (tx) => {
    await tx.matchEvent.deleteMany({ where: { matchId } });
    await tx.matchParticipant.deleteMany({ where: { matchId } });
    await tx.match.update({
      where: { id: matchId },
      data: {
        homeScore: null,
        awayScore: null,
        status: MatchStatus.SCHEDULED,
        manOfTheMatchId: null,
        knockoutWinnerId: null,
      },
    });
  });

  if (wasKnockout) {
    const { recomputeKnockoutBracket } = await import(
      "@/lib/tournament/knockout/bracket-service"
    );
    await recomputeKnockoutBracket();
  }

  const { settleMatchPredictions } = await import(
    "@/lib/predictions/settle-match-predictions"
  );
  await settleMatchPredictions(matchId);

  revalidateTournament();
  return { ok: true };
}

export async function toggleMatchBettingAction(
  matchId: string,
  bettingOpen: boolean
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  await prisma.match.update({
    where: { id: matchId },
    data: { bettingOpen },
  });

  revalidatePath("/bets");
  revalidatePath("/owner/matches");
  return { ok: true };
}

export async function seedTournamentScheduleAction(): Promise<
  OwnerActionResult<{ created: number; updated: number; errors: string[] }>
> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const { seedTournamentSchedule } = await import("@/lib/tournament/seed-tournament");
  const result = await seedTournamentSchedule();
  revalidateTournament();

  return {
    ok: true,
    data: {
      created: result.matchesCreated,
      updated: result.matchesUpdated,
      errors: result.errors,
    },
  };
}
