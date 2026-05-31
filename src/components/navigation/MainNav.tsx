"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  Coins,
  Calendar,
  User,
  Trophy,
  Shield,
} from "lucide-react";

const mainNavItems = [
  { href: "/my-team", label: "My Team", icon: Users },
  { href: "/predictions", label: "Predictions", icon: Target },
  { href: "/bets", label: "Bets & Punishments", icon: Coins },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
];

interface MainNavProps {
  teamName?: string | null;
  nation?: string | null;
  isOwner?: boolean;
}

export function MainNav({ teamName, nation, isOwner }: MainNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/my-team" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gold-500" />
            <span className="hidden font-bold text-white sm:inline">
              WC Fantasy Draft
            </span>
          </Link>

          {teamName && (
            <div className="hidden text-sm text-zinc-400 md:block">
              <span className="font-medium text-white">{teamName}</span>
              {nation && (
                <span className="ml-2 text-zinc-500">· {nation}</span>
              )}
            </div>
          )}

          {isOwner && (
            <Link
              href="/owner"
              className="flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 transition-colors hover:bg-gold-500/20"
            >
              <Shield className="h-3.5 w-3.5" />
              Owner Mode
            </Link>
          )}
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-pitch-600/20 text-pitch-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
