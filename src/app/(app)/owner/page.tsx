import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { Card, EmptyState } from "@/components/ui/card";
import { Shield, Users, Trophy, Calendar, Settings } from "lucide-react";

const OWNER_SECTIONS = [
  {
    icon: Users,
    title: "Players & Teams",
    description: "Manage player cards, national teams, and assignments.",
  },
  {
    icon: Calendar,
    title: "Matches & Events",
    description: "Create matches, enter results, and schedule events.",
  },
  {
    icon: Settings,
    title: "Scoring System",
    description: "Customize point values for goals, assists, cards, and more.",
  },
  {
    icon: Trophy,
    title: "Betting & Punishments",
    description: "Enable betting, create promoted bets, assign rewards.",
  },
];

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
          <p className="text-sm text-slate-400">
            Manage tournament data, scoring, betting, and league events.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OWNER_SECTIONS.map((section) => (
          <Card key={section.title} title={section.title} description={section.description}>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <section.icon className="h-5 w-5" />
              <span>Available in Phase 2</span>
            </div>
          </Card>
        ))}
      </div>

      <EmptyState
        title="Owner tools coming in Phase 2"
        description="Player management, match data entry, scoring configuration, and betting controls will be built on this foundation."
      />
    </div>
  );
}
