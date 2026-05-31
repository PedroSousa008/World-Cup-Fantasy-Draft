"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV, OWNER_NAV } from "@/lib/navigation";
import { UserRole } from "@prisma/client";
import { Shield } from "lucide-react";

interface BottomNavProps {
  userRole: UserRole;
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const isOwner = userRole === UserRole.OWNER;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
      <div className="flex items-stretch justify-around">
        {MAIN_NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-400" : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        {isOwner && (
          <Link
            href="/owner"
            className={cn(
              "flex flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
              pathname.startsWith("/owner") ? "text-amber-400" : "text-slate-400"
            )}
          >
            <Shield className="h-5 w-5" />
            <span>Owner</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function SidebarNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const isOwner = userRole === UserRole.OWNER;
  const navItems = isOwner ? [...MAIN_NAV, ...OWNER_NAV] : MAIN_NAV;

  return (
    <nav className="hidden md:flex md:flex-col md:gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? item.ownerOnly
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
