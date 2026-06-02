export {
  loadMatchdayInfos,
  getMatchdayInfo,
  openMatchdays,
  type MatchdayInfo,
} from "@/lib/powers/matchday";

import { loadMatchdayInfos } from "@/lib/powers/matchday";

/** Team edits, captain, and powers lock when the matchday's first kickoff has passed. */
export async function isTeamManagementLocked(matchday?: number): Promise<boolean> {
  const infos = await loadMatchdayInfos();
  if (matchday != null) {
    const info = infos.find((i) => i.matchday === matchday);
    return info ? !info.isOpen : false;
  }
  const current = infos.find((i) => i.hasStarted && !i.isSettled);
  if (current) return !current.isOpen;
  const next = infos.find((i) => !i.hasStarted);
  if (next) return !next.isOpen;
  return false;
}

export async function getCurrentMatchday(): Promise<number | null> {
  const infos = await loadMatchdayInfos();
  const open = infos.find((i) => i.isOpen);
  if (open) return open.matchday;
  const last = infos.filter((i) => i.hasStarted).pop();
  return last?.matchday ?? infos[0]?.matchday ?? null;
}
