"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { seedTournamentScheduleAction } from "@/lib/actions/owner/matches";
import { formatKickoff, matchScoreLabel } from "@/lib/tournament/format";
import { getNationFlag } from "@/lib/nations";
import type { TournamentMatchCard } from "@/lib/tournament/types";

type OwnerMatchListItem = {
  id: string;
  matchday: number | null;
  groupName: string | null;
  scheduledAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  bettingOpen: boolean;
  eventCount: number;
  homeTeam: { id: string; name: string; flagEmoji: string | null };
  awayTeam: { id: string; name: string; flagEmoji: string | null };
};

interface OwnerMatchesPanelProps {
  matches: OwnerMatchListItem[];
  basePath?: string;
}

export function OwnerMatchesPanel({
  matches,
  basePath = "/owner/matches-events/matches",
}: OwnerMatchesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const seed = () => {
    setSeedMessage(null);
    startTransition(async () => {
      const result = await seedTournamentScheduleAction();
      if (!result.ok) {
        setSeedMessage(result.error);
        return;
      }
      const { created, updated, errors } = result.data!;
      setSeedMessage(
        `Schedule synced: ${created} created, ${updated} updated.` +
          (errors.length ? ` Warnings: ${errors.slice(0, 3).join("; ")}` : "")
      );
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={seed} isLoading={pending} variant="success">
          Seed / sync tournament schedule
        </Button>
      </div>
      {seedMessage && <p className="text-sm text-white/70">{seedMessage}</p>}

      {matches.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Seed the tournament schedule to load all group stage fixtures (Matchdays 1–3)."
          accent="green"
        />
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const card: TournamentMatchCard = {
              id: m.id,
              matchday: m.matchday ?? 0,
              groupName: m.groupName,
              scheduledAt: m.scheduledAt,
              status: m.status as TournamentMatchCard["status"],
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              bettingOpen: m.bettingOpen,
              manOfTheMatchId: null,
              homeTeam: { ...m.homeTeam, slug: "", groupName: m.groupName },
              awayTeam: { ...m.awayTeam, slug: "", groupName: m.groupName },
            };
            const score = matchScoreLabel(card);
            return (
              <Link
                key={m.id}
                href={`${basePath}/${m.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/50">
                    MD{m.matchday} · Group {m.groupName} · {formatKickoff(m.scheduledAt)}
                  </p>
                  <p className="truncate font-semibold text-white">
                    {m.homeTeam.flagEmoji ?? getNationFlag(m.homeTeam.name)} {m.homeTeam.name}{" "}
                    {score ?? "vs"} {m.awayTeam.name}{" "}
                    {m.awayTeam.flagEmoji ?? getNationFlag(m.awayTeam.name)}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="font-semibold text-white/70">{m.status}</p>
                  <p className="text-white/45">{m.eventCount} events</p>
                  {m.bettingOpen && (
                    <span className="text-[#00C853]">Bets open</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
