import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/section-page";
import { Shield, Users, Calendar, Settings, Trophy } from "lucide-react";

const OWNER_SECTIONS = [
  {
    icon: Users,
    title: "Players & Teams",
    description: "Assign players to teams. Register players via nation folders + npm run player:add.",
    color: "text-[#0066FF]",
    bg: "bg-[#0066FF]/10",
    href: "/owner/players",
    available: true,
  },
  {
    icon: Calendar,
    title: "Matches & Events",
    description: "Create matches, enter results, and schedule events.",
    color: "text-[#00C853]",
    bg: "bg-[#00C853]/10",
    href: null,
    available: false,
  },
  {
    icon: Settings,
    title: "Scoring System",
    description: "Customize point values for goals, assists, cards, and more.",
    color: "text-[#0066FF]",
    bg: "bg-[#0066FF]/10",
    href: null,
    available: false,
  },
  {
    icon: Trophy,
    title: "Betting & Punishments",
    description: "Enable betting, create promoted bets, assign rewards.",
    color: "text-[#E53935]",
    bg: "bg-[#E53935]/10",
    href: null,
    available: false,
  },
];

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF]/15 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]">
          <Shield className="h-6 w-6 text-[#0066FF]" />
        </div>
        <PageHeader
          title="Owner Dashboard"
          description="Manage tournament data, scoring, betting, and league events."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OWNER_SECTIONS.map((section) => (
          <Card key={section.title} title={section.title} description={section.description}>
            {section.available && section.href ? (
              <Link
                href={section.href}
                className="flex items-center gap-3 text-sm font-semibold text-[#0066FF]"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.bg}`}
                >
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                </span>
                Open →
              </Link>
            ) : (
              <div className="flex items-center gap-3 text-sm text-[#081120]/45">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.bg}`}
                >
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                </span>
                <span>Coming soon</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <EmptyState
        title="Add players nation by nation"
        description="Add images to public/players/{nation}/, then run npm run player:add. Open a nation here to assign players to users."
        accent="blue"
      />
    </div>
  );
}
