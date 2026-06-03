"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { getNationFlag } from "@/lib/nations";
import { formatKickoff, formatKickoffDate, formatKickoffTime } from "@/lib/tournament/format";
import {
  eventTypeLabel,
  type MatchDetailResponse,
} from "@/lib/tournament/match-detail-types";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";

interface MatchDetailModalProps {
  matchId: string | null;
  onClose: () => void;
  /** Optional preview title while loading */
  previewTitle?: string;
}

export function MatchDetailModal({ matchId, onClose, previewTitle }: MatchDetailModalProps) {
  const [detail, setDetail] = useState<MatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(`/api/tournament/matches/${matchId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load match");
        const json = (await res.json()) as MatchDetailResponse;
        if (!cancelled) setDetail(json);
      } catch {
        if (!cancelled) setError("Could not load match details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const title = detail
    ? `${detail.homeTeam.name} vs ${detail.awayTeam.name}`
    : previewTitle ?? "Match details";

  const score =
    detail?.homeScore != null && detail?.awayScore != null
      ? `${detail.homeScore} – ${detail.awayScore}`
      : null;

  const eventsByType = useMemo(() => {
    if (!detail) return new Map<string, MatchDetailResponse["events"]>();
    const map = new Map<string, MatchDetailResponse["events"]>();
    for (const event of detail.events) {
      const list = map.get(event.eventType) ?? [];
      list.push(event);
      map.set(event.eventType, list);
    }
    return map;
  }, [detail]);

  const displayEventTypes = [
    SCORING_EVENT_TYPES.GOAL,
    SCORING_EVENT_TYPES.ASSIST,
    SCORING_EVENT_TYPES.YELLOW_CARD,
    SCORING_EVENT_TYPES.RED_CARD,
    SCORING_EVENT_TYPES.OWN_GOAL,
    SCORING_EVENT_TYPES.PENALTY_MISS,
    SCORING_EVENT_TYPES.PENALTY_SAVE,
  ];

  return (
    <MobileFullScreenModal
      open={Boolean(matchId)}
      onClose={onClose}
      title={title}
      subtitle="Match details"
    >
      {loading && !detail && (
        <div className="mx-auto max-w-md space-y-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-white/5" />
            <div className="h-16 rounded-xl bg-white/5" />
          </div>
          <div className="h-32 rounded-xl bg-white/5" />
        </div>
      )}

      {error && !detail && (
        <p className="rounded-xl bg-[#E53935]/15 px-4 py-3 text-sm text-[#E53935]">{error}</p>
      )}

      {detail && (
        <div className="mx-auto max-w-md space-y-5 pb-4">
          <div className="flex items-center justify-between gap-4">
            <TeamBlock
              name={detail.homeTeam.name}
              flag={detail.homeTeam.flagEmoji}
            />
            <div className="shrink-0 text-center">
              {score ? (
                <p className="text-3xl font-black tabular-nums text-white">{score}</p>
              ) : (
                <p className="text-lg font-semibold text-white/40">vs</p>
              )}
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                {detail.status === "FINISHED"
                  ? "Full time"
                  : detail.status === "LIVE"
                    ? "Live"
                    : detail.status.toLowerCase()}
              </p>
            </div>
            <TeamBlock
              name={detail.awayTeam.name}
              flag={detail.awayTeam.flagEmoji}
              align="right"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <InfoCell label="Date" value={formatKickoffDate(detail.scheduledAt)} />
            <InfoCell label="Time" value={formatKickoffTime(detail.scheduledAt)} />
            <InfoCell label="Matchday" value={detail.matchday != null ? String(detail.matchday) : "—"} />
            <InfoCell label="Group" value={detail.groupName ?? (detail.stage === "KNOCKOUT" ? "Knockout" : "—")} />
          </dl>

          <p className="text-center text-xs text-white/40">{formatKickoff(detail.scheduledAt)}</p>

          {detail.manOfTheMatch && (
            <section className="rounded-xl bg-[#FFD700]/10 px-4 py-3 ring-1 ring-[#FFD700]/25">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]/80">
                MVP
              </p>
              <p className="mt-1 font-semibold text-white">{detail.manOfTheMatch.name}</p>
            </section>
          )}

          {displayEventTypes.map((type) => {
            const events = eventsByType.get(type);
            if (!events?.length) return null;
            return (
              <EventSection
                key={type}
                title={eventTypeLabel(type)}
                events={events}
              />
            );
          })}

          {detail.status === "FINISHED" &&
            detail.events.length === 0 &&
            !detail.manOfTheMatch && (
              <p className="text-center text-sm text-white/45">
                No event details recorded for this match yet.
              </p>
            )}
        </div>
      )}
    </MobileFullScreenModal>
  );
}

function TeamBlock({
  name,
  flag,
  align = "left",
}: {
  name: string;
  flag: string | null;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className="text-3xl">{flag ?? getNationFlag(name)}</span>
      <p className="mt-2 text-sm font-semibold text-white">{name}</p>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/8">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</dt>
      <dd className="mt-0.5 font-semibold text-white">{value}</dd>
    </div>
  );
}

function EventSection({
  title,
  events,
}: {
  title: string;
  events: MatchDetailResponse["events"];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/45">{title}</h3>
      <ul className="space-y-1.5">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/8"
          >
            <span className="text-sm font-medium text-white">
              {event.player?.name ?? "Unknown player"}
            </span>
            {event.minute != null && (
              <span className="shrink-0 text-xs tabular-nums text-white/45">{event.minute}&apos;</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
