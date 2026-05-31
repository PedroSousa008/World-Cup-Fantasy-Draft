"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { SidebarNav, BottomNav } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
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
  const isOwner = user.role === UserRole.OWNER;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/my-team" className="flex items-center gap-2">
              <span className="text-xl">⚽</span>
              <span className="hidden font-bold text-white sm:inline">{APP_NAME}</span>
            </Link>
            {isOwner && (
              <span className="hidden items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 sm:flex">
                <Shield className="h-3 w-3" />
                Owner
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user.teamName}</p>
              <p className="text-xs text-slate-400">
                {user.username} · {user.selectedNation}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <SidebarNav userRole={user.role} />
        </aside>
        <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>
      </div>

      <BottomNav userRole={user.role} />
    </div>
  );
}
