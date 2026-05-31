import { auth } from "@/lib/auth";
import { Card, EmptyState } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { Trophy, Target, TrendingUp } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your personal dashboard and performance overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Profile Information">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-400">Username</dt>
              <dd className="font-medium text-white">{user.username}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Team Name</dt>
              <dd className="font-medium text-white">{user.teamName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Selected Nation</dt>
              <dd className="font-medium text-white">{user.selectedNation}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Account Type</dt>
              <dd className="font-medium text-white">
                {user.role === UserRole.OWNER ? "Owner" : "Player"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Performance">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Current Rank</dt>
              <dd className="font-medium text-white">—</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Total Points</dt>
              <dd className="font-medium text-white">0</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Matchday Points</dt>
              <dd className="font-medium text-white">0</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Bets Won / Lost</dt>
              <dd className="font-medium text-white">0 / 0</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Prediction Accuracy</dt>
              <dd className="font-medium text-white">—</dd>
            </div>
          </dl>
        </Card>

        <Card title="Quick Overview">
          <div className="space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Leaderboard: coming soon
            </p>
            <p className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Active bets: 0
            </p>
            <p className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Upcoming matches: 0
            </p>
          </div>
        </Card>
      </div>

      <EmptyState
        title="Achievements coming soon"
        description="Trophies, records, and badges will be earned throughout the tournament."
      />
    </div>
  );
}
