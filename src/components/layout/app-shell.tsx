"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";
import { SidebarNav, BottomNav } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/branding/app-logo";
import { WorldCupBackground } from "@/components/design/world-cup-background";
import { getScreenTheme } from "@/lib/design/theme";
import { UserRole } from "@prisma/client";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    username: string;
    teamName: string;
    selectedNation: string;
    role: UserRole;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const theme = getScreenTheme(pathname);
  const isOwner = user.role === UserRole.OWNER;

  const isMyTeam = pathname.startsWith("/my-team");
  const isPlayerPage = pathname.includes("/my-team/player/");

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white" data-app-root>
      <WorldCupBackground theme={theme} />

      <header className="wc-glass sticky top-0 z-40 border-b">
        <div
          className={`mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 ${
            isMyTeam ? "max-w-lg" : "max-w-7xl"
          }`}
        >
          <Link href="/my-team" className="min-w-0 shrink">
            <AppLogo showName={!isMyTeam} />
          </Link>

          <div className="flex items-center gap-2">
            {isOwner && !isMyTeam && (
              <span className="hidden items-center gap-1.5 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-2.5 py-1 text-xs font-semibold text-[#0066FF] sm:flex">
                <Shield className="h-3 w-3" />
                Owner
              </span>
            )}
            {!isMyTeam && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{user.teamName}</p>
                <p className="text-xs text-white/50">
                  {user.username} · {user.selectedNation}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              className="min-h-[44px] min-w-[44px]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`mx-auto px-0 py-0 sm:px-6 sm:py-6 ${
          isMyTeam ? "max-w-lg" : "flex max-w-7xl gap-8 px-4"
        }`}
      >
        {!isMyTeam && (
          <aside className="hidden w-56 shrink-0 md:block">
            <SidebarNav userRole={user.role} />
          </aside>
        )}
        <main
          className={`wc-stagger min-w-0 flex-1 overflow-x-hidden ${
            isMyTeam ? "pb-24" : "pb-24 md:pb-8"
          }`}
        >
          {children}
        </main>
      </div>

      <BottomNav userRole={user.role} hidden={isPlayerPage} />
    </div>
  );
}
