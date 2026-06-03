import type { MatchStatus } from "@prisma/client";

export interface ParticipationTeam {
  teamId: string;
  teamName: string;
  flagEmoji: string | null;
  /** Win bonus applies when reason includes win */
  reasons: ("win" | "clean_sheet")[];
}

/**
 * Teams requiring player participation selection after a finished match is saved.
 * - Win: winning team only (win + possible clean sheet)
 * - 0-0: both teams (clean sheet for selected GK/DEF only)
 * - Draw with goals: none
 */
export function getParticipationTeams(
  status: MatchStatus | string,
  homeScore: number,
  awayScore: number,
  homeTeam: { id: string; name: string; flagEmoji: string | null },
  awayTeam: { id: string; name: string; flagEmoji: string | null }
): ParticipationTeam[] | null {
  if (status !== "FINISHED") return null;

  if (homeScore === awayScore) {
    if (homeScore === 0) {
      return [
        {
          teamId: homeTeam.id,
          teamName: homeTeam.name,
          flagEmoji: homeTeam.flagEmoji,
          reasons: ["clean_sheet"],
        },
        {
          teamId: awayTeam.id,
          teamName: awayTeam.name,
          flagEmoji: awayTeam.flagEmoji,
          reasons: ["clean_sheet"],
        },
      ];
    }
    return null;
  }

  const homeWins = homeScore > awayScore;
  const winner = homeWins ? homeTeam : awayTeam;
  const loserScore = homeWins ? awayScore : homeScore;
  const reasons: ("win" | "clean_sheet")[] = ["win"];
  if (loserScore === 0) reasons.push("clean_sheet");

  return [
    {
      teamId: winner.id,
      teamName: winner.name,
      flagEmoji: winner.flagEmoji,
      reasons,
    },
  ];
}

export function matchNeedsParticipation(
  status: MatchStatus | string,
  homeScore: number | null,
  awayScore: number | null
): boolean {
  if (status !== "FINISHED" || homeScore == null || awayScore == null) return false;
  if (homeScore === awayScore) return homeScore === 0;
  return true;
}
