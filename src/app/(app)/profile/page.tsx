import { auth } from "@/lib/auth";
import { getBranding } from "@/lib/branding/get-branding";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/section-page";
import { AppLogoStatic } from "@/components/branding/app-logo";
import { UserRole } from "@prisma/client";
import { Trophy, Target, TrendingUp, User } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;
  const branding = await getBranding();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#0066FF]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-[#00C853]/8 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
              {branding.appLogoUrl || branding.appIconUrl ? (
                <AppLogoStatic branding={branding} showName={false} size="lg" variant="logo" />
              ) : (
                <User className="h-8 w-8 text-[#0066FF]" />
              )}
            </div>
            <div>
              <h1 className="text-display text-2xl">{user.teamName}</h1>
              <p className="text-body text-sm">
                {user.username} · {user.selectedNation}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-[#0066FF]/15 px-2.5 py-0.5 text-xs font-semibold text-[#0066FF]">
                {user.role === UserRole.OWNER ? "Owner" : "Player"}
              </span>
            </div>
          </div>
          <div className="flex gap-6 text-center sm:text-right">
            <div>
              <p className="text-display text-2xl text-white">—</p>
              <p className="text-xs text-white/45">Rank</p>
            </div>
            <div>
              <p className="text-display text-2xl text-[#0066FF]">0</p>
              <p className="text-xs text-white/45">Points</p>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Performance"
        description="Your tournament stats and quick overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Profile Information">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[#081120]/50">Username</dt>
              <dd className="font-semibold text-[#081120]">{user.username}</dd>
            </div>
            <div>
              <dt className="text-[#081120]/50">Team Name</dt>
              <dd className="font-semibold text-[#081120]">{user.teamName}</dd>
            </div>
            <div>
              <dt className="text-[#081120]/50">Selected Nation</dt>
              <dd className="font-semibold text-[#081120]">{user.selectedNation}</dd>
            </div>
            <div>
              <dt className="text-[#081120]/50">League</dt>
              <dd className="font-semibold text-[#081120]">{branding.appName}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Performance">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#081120]/50">Matchday Points</dt>
              <dd className="font-semibold text-[#0066FF]">0</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#081120]/50">Bets Won / Lost</dt>
              <dd className="font-semibold">
                <span className="text-[#00C853]">0</span>
                <span className="text-[#081120]/30"> / </span>
                <span className="text-[#E53935]">0</span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#081120]/50">Prediction Accuracy</dt>
              <dd className="font-semibold text-[#081120]">—</dd>
            </div>
          </dl>
        </Card>

        <Card title="Quick Overview">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-[#081120]/65">
              <TrendingUp className="h-4 w-4 text-[#0066FF]" />
              Leaderboard: coming soon
            </p>
            <p className="flex items-center gap-2 text-[#081120]/65">
              <Trophy className="h-4 w-4 text-[#00C853]" />
              Active bets: 0
            </p>
            <p className="flex items-center gap-2 text-[#081120]/65">
              <Target className="h-4 w-4 text-[#0066FF]" />
              Upcoming matches: 0
            </p>
          </div>
        </Card>
      </div>

      <EmptyState
        title="Achievements coming soon"
        description="Trophies, records, and badges will be earned throughout the tournament."
        accent="blue"
      />
    </div>
  );
}
