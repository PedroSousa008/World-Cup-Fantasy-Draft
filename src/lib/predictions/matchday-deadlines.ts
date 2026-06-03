/** Matchday-wide prediction deadlines (15:00 Western European Summer Time). */
const MATCHDAY_DEADLINE_ISO: Record<number, string> = {
  1: "2026-06-11T14:00:00.000Z",
  2: "2026-06-18T14:00:00.000Z",
  3: "2026-06-24T14:00:00.000Z",
};

export const EXACT_SCORE_PREDICTION_POINTS = 5;

export function getMatchdayPredictionDeadline(matchday: number): Date | null {
  const iso = MATCHDAY_DEADLINE_ISO[matchday];
  return iso ? new Date(iso) : null;
}

export function formatMatchdayDeadline(matchday: number): string | null {
  const deadline = getMatchdayPredictionDeadline(matchday);
  if (!deadline) return null;
  return deadline.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isMatchdayPredictionsLocked(matchday: number, now = new Date()): boolean {
  const deadline = getMatchdayPredictionDeadline(matchday);
  if (!deadline) return false;
  return now >= deadline;
}

/** Lock knockout / later matchdays at kickoff when no matchday deadline exists. */
export function isMatchPredictionLocked(
  matchday: number,
  scheduledAt: string | Date,
  now = new Date()
): boolean {
  const matchdayDeadline = getMatchdayPredictionDeadline(matchday);
  if (matchdayDeadline) return now >= matchdayDeadline;
  return now >= new Date(scheduledAt);
}
