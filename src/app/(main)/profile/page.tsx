import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth";
import { User, Trophy, Award, LogOut } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;

  return (
    <>
      <PageHeader title="Profile" description="Your personal dashboard" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile Information">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <User className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-white">{user.username}</p>
              <p className="text-sm text-zinc-400">{user.email}</p>
              {user.teamName && (
                <p className="text-sm text-pitch-400">{user.teamName}</p>
              )}
              {user.nation && (
                <p className="text-sm text-zinc-500">Nation: {user.nation}</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Performance">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Current Rank", value: "—" },
              { label: "Total Points", value: "0" },
              { label: "Matchday Points", value: "0" },
              { label: "Bets Won", value: "0" },
              { label: "Bets Lost", value: "0" },
              { label: "Prediction Accuracy", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Overview">
          <EmptyState
            icon={<Trophy className="h-10 w-10" />}
            title="Competition not started"
            description="Leaderboard position, active bets, and upcoming matches will show here."
          />
        </Card>

        <Card title="Achievements">
          <EmptyState
            icon={<Award className="h-10 w-10" />}
            title="No achievements yet"
            description="Trophies, records, and badges will unlock as you compete."
          />
        </Card>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <Button type="submit" variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </>
  );
}
