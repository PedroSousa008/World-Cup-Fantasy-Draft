import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  Users,
  Flag,
  Swords,
  Calculator,
  Coins,
  Gavel,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

const managementSections = [
  {
    href: "/owner/players",
    title: "Players",
    description: "Create and manage player cards",
    icon: Users,
  },
  {
    href: "/owner/teams",
    title: "National Teams",
    description: "Teams, flags, groups, and qualification status",
    icon: Flag,
  },
  {
    href: "/owner/matches",
    title: "Matches",
    description: "Schedule, scores, and match events",
    icon: Swords,
  },
  {
    href: "/owner/scoring",
    title: "Scoring System",
    description: "Customize fantasy point values",
    icon: Calculator,
  },
  {
    href: "/owner/betting",
    title: "Betting",
    description: "Enable betting, promoted bets, and announcements",
    icon: Coins,
  },
  {
    href: "/owner/punishments",
    title: "Rewards & Punishments",
    description: "Assign by ranking position",
    icon: Gavel,
  },
  {
    href: "/owner/calendar",
    title: "Calendar",
    description: "Matchdays, drafts, and deadlines",
    icon: CalendarDays,
  },
];

export default function OwnerDashboardPage() {
  return (
    <>
      <PageHeader
        title="Owner Dashboard"
        description="Manage tournament data — the platform calculates everything else"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {managementSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="transition-colors hover:border-gold-500/30 hover:bg-zinc-900">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gold-500/10 p-2">
                    <Icon className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{section.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
