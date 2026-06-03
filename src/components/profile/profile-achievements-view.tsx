"use client";

import type { ProfileAchievementsPayload } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { ProfileSection } from "@/components/profile/profile-ui";
import { ProfileAchievementsSkeleton } from "@/components/profile/profile-tab-skeleton";
import { cn } from "@/lib/utils";

function powerStatusClass(status: string): string {
  switch (status) {
    case "available":
      return "text-[#00C853] bg-[#00C853]/10 border-[#00C853]/25";
    case "used":
      return "text-white/55 bg-white/5 border-white/10";
    case "active":
    case "pending":
      return "text-[#0066FF] bg-[#0066FF]/10 border-[#0066FF]/25";
    default:
      return "text-white/40 bg-white/5 border-white/10";
  }
}

export function ProfileAchievementsView() {
  const { data, loading } = useProfileTab<ProfileAchievementsPayload>("achievements");

  if (loading || !data) {
    return <ProfileAchievementsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ProfileSection
        title="Powers"
        description="See which special powers you have left this tournament."
      >
        <ul className="space-y-2">
          {data.powers.map((power) => (
            <li
              key={power.type}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {power.icon}
                </span>
                <span className="truncate text-sm font-semibold text-white">{power.name}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  powerStatusClass(power.status)
                )}
              >
                {power.statusLabel}
              </span>
            </li>
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection
        title="Matchday History"
        description="Your fantasy points after every matchday. Updates automatically."
      >
        {data.matchdayHistory.length === 0 ? (
          <p className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/45">
            No matchday history yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div className="grid grid-cols-2 border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-white/40">
              <div className="px-4 py-3">Matchday</div>
              <div className="px-4 py-3 text-right">Points</div>
            </div>
            <ul className="divide-y divide-white/6">
              {data.matchdayHistory.map((row) => (
                <li
                  key={row.matchday}
                  className="grid grid-cols-2 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-white">MD{row.matchday}</span>
                  <span className="text-right font-bold tabular-nums text-[#0066FF]">
                    {row.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
