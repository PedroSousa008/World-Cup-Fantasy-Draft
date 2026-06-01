import type { RivalChallenge, UserPower } from "@prisma/client";
import {
  computeBaseSquadMatchdayPoints,
  type PowerScoringContext,
} from "@/lib/powers/scoring-context";

const ACTIVE_STATUSES = new Set(["PENDING", "ACTIVE", "USED"]);

function isActivePower(power: UserPower): boolean {
  return ACTIVE_STATUSES.has(power.status);
}

export interface PowerPointsIndex {
  powersByUserMatchday: Map<string, UserPower[]>;
  cursesOnUserMatchday: Map<string, UserPower[]>;
  rivalByUserMatchday: Map<string, RivalChallenge>;
}

export function buildPowerPointsIndex(
  powers: UserPower[],
  rivals: RivalChallenge[]
): PowerPointsIndex {
  const powersByUserMatchday = new Map<string, UserPower[]>();
  const cursesOnUserMatchday = new Map<string, UserPower[]>();
  const rivalByUserMatchday = new Map<string, RivalChallenge>();

  for (const power of powers) {
    if (!isActivePower(power) || power.matchday == null) continue;

    if (power.powerType === "CURSE" && power.targetUserId) {
      const curseKey = `${power.targetUserId}:${power.matchday}`;
      const curseList = cursesOnUserMatchday.get(curseKey) ?? [];
      curseList.push(power);
      cursesOnUserMatchday.set(curseKey, curseList);
      continue;
    }

    const key = `${power.userId}:${power.matchday}`;
    const list = powersByUserMatchday.get(key) ?? [];
    list.push(power);
    powersByUserMatchday.set(key, list);
  }

  for (const rival of rivals) {
    if (rival.status !== "USED" || rival.matchday == null) continue;
    rivalByUserMatchday.set(`${rival.challengerId}:${rival.matchday}`, rival);
    rivalByUserMatchday.set(`${rival.opponentId}:${rival.matchday}`, rival);
  }

  return { powersByUserMatchday, cursesOnUserMatchday, rivalByUserMatchday };
}

/** In-memory matchday points (no per-user DB round-trips). */
export function computeUserMatchdayPointsFromIndex(
  userId: string,
  matchday: number,
  ctx: PowerScoringContext,
  index: PowerPointsIndex
): number {
  const rival = index.rivalByUserMatchday.get(`${userId}:${matchday}`);
  if (rival) {
    if (rival.challengerId === userId && rival.challengerFinalPoints != null) {
      return rival.challengerFinalPoints;
    }
    if (rival.opponentId === userId && rival.opponentFinalPoints != null) {
      return rival.opponentFinalPoints;
    }
  }

  let total = computeBaseSquadMatchdayPoints(ctx, userId, matchday);

  const powers = index.powersByUserMatchday.get(`${userId}:${matchday}`) ?? [];
  for (const power of powers) {
    switch (power.powerType) {
      case "DOUBLE_POINTS": {
        if (power.targetPlayerId) {
          total += ctx.getPlayerMatchdayPoints(power.targetPlayerId, matchday);
        }
        break;
      }
      case "TRIPLE_CAPTAIN": {
        const team = ctx.fantasyTeams.get(userId);
        if (team?.captainId) {
          total += ctx.getPlayerMatchdayPoints(team.captainId, matchday);
        }
        break;
      }
      default:
        break;
    }
  }

  const curses = index.cursesOnUserMatchday.get(`${userId}:${matchday}`) ?? [];
  for (const curse of curses) {
    if (!curse.targetPlayerId) continue;
    const base = ctx.getPlayerMatchdayPoints(curse.targetPlayerId, matchday);
    total -= base - Math.floor(base / 2);
  }

  return total;
}
