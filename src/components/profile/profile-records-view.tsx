"use client";

import type { ProfileRecordsPayload } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import {
  ProfileLeaderRow,
  ProfileRecordCard,
  ProfileSection,
} from "@/components/profile/profile-ui";
import { ProfileRecordsSkeleton } from "@/components/profile/profile-tab-skeleton";

function formatMatchdayRecord(
  record: ProfileRecordsPayload["bestMatchday"],
  empty: string
): { primary: string; secondary: string } {
  if (!record) return { primary: empty, secondary: "—" };
  return {
    primary: `Matchday ${record.matchday}`,
    secondary: `${record.points} Points`,
  };
}

export function ProfileRecordsView() {
  const { data, loading } = useProfileTab<ProfileRecordsPayload>("records");

  if (loading || !data) {
    return <ProfileRecordsSkeleton />;
  }

  const best = formatMatchdayRecord(data.bestMatchday, "No data yet");
  const worst = formatMatchdayRecord(data.worstMatchday, "No data yet");

  return (
    <div className="space-y-8">
      <ProfileSection title="Personal Records" description="Calculated automatically from your fantasy results.">
        <div className="grid gap-3 sm:grid-cols-3">
          <ProfileRecordCard title="Best Matchday" primary={best.primary} secondary={best.secondary} />
          <ProfileRecordCard title="Worst Matchday" primary={worst.primary} secondary={worst.secondary} />
          <ProfileRecordCard
            title="Longest Top 3 Streak"
            primary={`${data.longestTop3Streak} Matchdays`}
            secondary="Consecutive matchdays in top 3"
          />
        </div>
      </ProfileSection>

      <ProfileSection title="Team Leaders" description="Standout players from your current squad.">
        <div className="space-y-2">
          {data.highestScoringPlayer ? (
            <ProfileLeaderRow
              label="Highest Scoring Player"
              name={data.highestScoringPlayer.name}
              nationFlag={data.highestScoringPlayer.nationFlag}
              stat={String(data.highestScoringPlayer.value)}
              statLabel="Points"
            />
          ) : null}
          {data.lowestScoringPlayer ? (
            <ProfileLeaderRow
              label="Lowest Scoring Player"
              name={data.lowestScoringPlayer.name}
              nationFlag={data.lowestScoringPlayer.nationFlag}
              stat={String(data.lowestScoringPlayer.value)}
              statLabel="Points"
            />
          ) : null}
          {data.mostGoals ? (
            <ProfileLeaderRow
              label="Most Goals"
              name={data.mostGoals.name}
              nationFlag={data.mostGoals.nationFlag}
              stat={String(data.mostGoals.value)}
              statLabel="Goals"
            />
          ) : null}
          {data.mostAssists ? (
            <ProfileLeaderRow
              label="Most Assists"
              name={data.mostAssists.name}
              nationFlag={data.mostAssists.nationFlag}
              stat={String(data.mostAssists.value)}
              statLabel="Assists"
            />
          ) : null}
          {!data.highestScoringPlayer &&
          !data.lowestScoringPlayer &&
          !data.mostGoals &&
          !data.mostAssists ? (
            <p className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/45">
              Assign players to your squad to see team leaders.
            </p>
          ) : null}
        </div>
      </ProfileSection>
    </div>
  );
}
