import { prisma } from "@/lib/db/prisma";
import { loadPowerScoringContext } from "@/lib/powers/scoring-context";
import { MATCHDAY_COUNT } from "@/lib/scoring/constants";
import { getMatchPredictionPointsByUser } from "@/lib/predictions/settle-match-predictions";
import {
  buildPowerPointsIndex,
  type PowerPointsIndex,
} from "@/lib/rankings/power-points-index";
import type { PowerScoringContext } from "@/lib/powers/scoring-context";

export interface LeagueUserPointsRow {
  id: string;
  teamName: string;
  selectedNation: string;
  manualPointsAdjustment: number;
  predictionPoints: number;
}

export interface LeaguePointsContext {
  matchdays: number[];
  scoringCtx: PowerScoringContext;
  powerIndex: PowerPointsIndex;
  users: LeagueUserPointsRow[];
}

const CONTEXT_CACHE_TTL_MS = 25_000;

let contextCache: { ctx: LeaguePointsContext; at: number } | null = null;
let contextPromise: Promise<LeaguePointsContext> | null = null;

export function invalidateLeaguePointsContext(): void {
  contextCache = null;
  contextPromise = null;
}

async function buildLeaguePointsContext(): Promise<LeaguePointsContext> {
  const matchdays = Array.from({ length: MATCHDAY_COUNT }, (_, i) => i + 1);

  const [scoringCtx, users, allPowers, allRivals, predictionPointsByUser] =
    await Promise.all([
    loadPowerScoringContext(),
    prisma.user.findMany({
      select: {
        id: true,
        teamName: true,
        selectedNation: true,
        manualPointsAdjustment: true,
      },
      orderBy: { teamName: "asc" },
    }),
    prisma.userPower.findMany({
      where: {
        matchday: { not: null },
        status: { in: ["PENDING", "ACTIVE", "USED"] },
      },
    }),
    prisma.rivalChallenge.findMany({
      where: { status: "USED" },
    }),
    getMatchPredictionPointsByUser(),
  ]);

  const powerIndex = buildPowerPointsIndex(allPowers, allRivals);

  return {
    matchdays,
    scoringCtx,
    powerIndex,
    users: users.map((user) => ({
      id: user.id,
      teamName: user.teamName,
      selectedNation: user.selectedNation,
      manualPointsAdjustment: user.manualPointsAdjustment,
      predictionPoints: predictionPointsByUser.get(user.id) ?? 0,
    })),
  };
}

export async function loadLeaguePointsContext(): Promise<LeaguePointsContext> {
  if (contextCache && Date.now() - contextCache.at <= CONTEXT_CACHE_TTL_MS) {
    return contextCache.ctx;
  }

  if (contextPromise) {
    return contextPromise;
  }

  contextPromise = buildLeaguePointsContext()
    .then((ctx) => {
      contextCache = { ctx, at: Date.now() };
      contextPromise = null;
      return ctx;
    })
    .catch((err) => {
      contextPromise = null;
      throw err;
    });

  return contextPromise;
}
