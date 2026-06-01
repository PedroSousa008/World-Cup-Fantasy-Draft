import { prisma } from "@/lib/db/prisma";
import { MATCHDAY_COUNT } from "@/lib/scoring/constants";
import type { MatchStatus } from "@prisma/client";

export interface MatchdayInfo {
  matchday: number;
  isOpen: boolean;
  hasStarted: boolean;
  isSettled: boolean;
  kickoffAt: Date | null;
}

export async function loadMatchdayInfos(): Promise<MatchdayInfo[]> {
  const matches = await prisma.match.findMany({
    where: { matchday: { not: null } },
    select: { matchday: true, status: true, scheduledAt: true },
  });

  const byMd = new Map<number, { statuses: MatchStatus[]; kickoffs: Date[] }>();

  for (const m of matches) {
    if (m.matchday == null) continue;
    const bucket = byMd.get(m.matchday) ?? { statuses: [], kickoffs: [] };
    bucket.statuses.push(m.status);
    bucket.kickoffs.push(m.scheduledAt);
    byMd.set(m.matchday, bucket);
  }

  const infos: MatchdayInfo[] = [];

  for (let md = 1; md <= MATCHDAY_COUNT; md++) {
    const bucket = byMd.get(md);
    if (!bucket) {
      infos.push({
        matchday: md,
        isOpen: true,
        hasStarted: false,
        isSettled: false,
        kickoffAt: null,
      });
      continue;
    }

    const hasLive = bucket.statuses.some((s) => s === "LIVE");
    const hasFinished = bucket.statuses.some((s) => s === "FINISHED");
    const allFinished =
      bucket.statuses.length > 0 && bucket.statuses.every((s) => s === "FINISHED");
    const earliestKickoff = new Date(
      Math.min(...bucket.kickoffs.map((d) => d.getTime()))
    );
    const now = Date.now();
    const hasStarted =
      hasLive || hasFinished || (earliestKickoff.getTime() <= now && !allFinished);

    infos.push({
      matchday: md,
      isOpen: !hasStarted,
      hasStarted,
      isSettled: allFinished,
      kickoffAt: earliestKickoff,
    });
  }

  return infos;
}

export function getMatchdayInfo(
  infos: MatchdayInfo[],
  matchday: number
): MatchdayInfo | undefined {
  return infos.find((i) => i.matchday === matchday);
}

export function openMatchdays(infos: MatchdayInfo[]): number[] {
  return infos.filter((i) => i.isOpen).map((i) => i.matchday);
}
