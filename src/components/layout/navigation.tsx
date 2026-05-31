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
    <nav className="wc-glass fixed bottom-0 left-0 right-0 z-50 border-t md:hidden">
      <div className="flex items-stretch justify-around px-1">
        {MAIN_NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-all duration-300",
                isActive
                  ? "text-[#0066FF]"
                  : "text-white/45 hover:text-white/70"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                  isActive && "bg-[#0066FF]/15"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        {isOwner && (
          <Link
            href="/owner"
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-all duration-300",
              pathname.startsWith("/owner")
                ? "text-[#0066FF]"
                : "text-white/45 hover:text-white/70"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                pathname.startsWith("/owner") && "bg-[#0066FF]/15"
              )}
            >
              <Shield className="h-5 w-5" />
            </span>
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
    <nav className="hidden flex-col gap-1 md:flex">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-[#0066FF]/15 text-[#0066FF] shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]"
                : "text-white/50 hover:bg-white/5 hover:text-white/85"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-105",
                isActive && "text-[#0066FF]"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
