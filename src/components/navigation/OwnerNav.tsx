"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Flag,
  Swords,
  Calculator,
  Coins,
  Gavel,
  CalendarDays,
  Shield,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const ownerNavItems = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/players", label: "Players", icon: Users },
  { href: "/owner/teams", label: "National Teams", icon: Flag },
  { href: "/owner/matches", label: "Matches", icon: Swords },
  { href: "/owner/scoring", label: "Scoring", icon: Calculator },
  { href: "/owner/betting", label: "Betting", icon: Coins },
  { href: "/owner/punishments", label: "Rewards & Punishments", icon: Gavel },
  { href: "/owner/calendar", label: "Calendar", icon: CalendarDays },
];

export function OwnerNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
        <Shield className="h-5 w-5 text-gold-500" />
        <span className="font-bold text-white">Owner Mode</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ownerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/owner" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold-500/10 text-gold-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-2">
        <Link
          href="/my-team"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          ← Back to App
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
