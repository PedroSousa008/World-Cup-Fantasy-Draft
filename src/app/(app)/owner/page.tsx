import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { Card, EmptyState } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/section-page";
import { AppBrandingForm } from "@/components/owner/app-branding-form";
import { getBranding } from "@/lib/branding/get-branding";
import { AppLogoStatic } from "@/components/branding/app-logo";
import { Shield, Users, Calendar, Settings, Trophy, Palette } from "lucide-react";

const OWNER_SECTIONS = [
  {
    icon: Users,
    title: "Players & Teams",
    description: "Manage player cards, national teams, and assignments.",
    color: "text-[#0066FF]",
    bg: "bg-[#0066FF]/10",
  },
  {
    icon: Calendar,
    title: "Matches & Events",
    description: "Create matches, enter results, and schedule events.",
    color: "text-[#00C853]",
    bg: "bg-[#00C853]/10",
  },
  {
    icon: Settings,
    title: "Scoring System",
    description: "Customize point values for goals, assists, cards, and more.",
    color: "text-[#0066FF]",
    bg: "bg-[#0066FF]/10",
  },
  {
    icon: Trophy,
    title: "Betting & Punishments",
    description: "Enable betting, create promoted bets, assign rewards.",
    color: "text-[#E53935]",
    bg: "bg-[#E53935]/10",
  },
];

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const branding = await getBranding();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center gap-4">
        <AppLogoStatic branding={branding} showName={false} size="lg" />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF]/15 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]">
          <Shield className="h-6 w-6 text-[#0066FF]" />
        </div>
        <PageHeader
          title="Owner Dashboard"
          description="Manage tournament data, scoring, betting, and league branding."
        />
      </div>

      <Card
        title="App Branding"
        description="Upload your app logo and icon. Changes appear across login, header, profile, and PWA."
      >
        <div className="mb-4 flex items-center gap-2 text-sm text-[#081120]/50">
          <Palette className="h-4 w-4 text-[#0066FF]" />
          Logo appears on login, signup, header, profile, favicon & mobile home screen
        </div>
        <AppBrandingForm initial={branding} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {OWNER_SECTIONS.map((section) => (
          <Card key={section.title} title={section.title} description={section.description}>
            <div className="flex items-center gap-3 text-sm text-[#081120]/45">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.bg}`}>
                <section.icon className={`h-4 w-4 ${section.color}`} />
              </span>
              <span>Available in Phase 2</span>
            </div>
          </Card>
        ))}
      </div>

      <EmptyState
        title="Owner tools coming in Phase 2"
        description="Player management, match data entry, scoring configuration, and betting controls will be built on this foundation."
        accent="blue"
      />
    </div>
  );
}
