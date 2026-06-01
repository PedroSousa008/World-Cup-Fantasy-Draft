"use client";

import { WorldCupBackground } from "@/components/design/world-cup-background";
import { AppLogo } from "@/components/branding/app-logo";
import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-4 py-12">
      <WorldCupBackground theme="auth" />
      <div className="animate-wc-flow-in mb-8">
        <Link href="/">
          <AppLogo showName size="lg" />
        </Link>
      </div>
      <div className="animate-wc-flow-in w-full max-w-md" style={{ animationDelay: "0.08s" }}>
        {children}
      </div>
      {footer && (
        <div
          className="animate-wc-flow-in mt-4 w-full max-w-md text-center text-sm text-white/60"
          style={{ animationDelay: "0.14s" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
