export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwnerCreated } from "@/lib/auth/permissions";
import { getBranding } from "@/lib/branding/get-branding";
import { Button } from "@/components/ui/button";
import { AppLogoStatic } from "@/components/branding/app-logo";
import { WorldCupBackground } from "@/components/design/world-cup-background";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/my-team");
  }

  const [ownerExists, branding] = await Promise.all([isOwnerCreated(), getBranding()]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-4">
      <WorldCupBackground theme="auth" />

      <div className="animate-wc-flow-in mx-auto w-full max-w-xl text-center">
        <div className="mb-8 flex justify-center">
          <AppLogoStatic branding={branding} showName={false} size="hero" priority />
        </div>
        <p className="text-body mx-auto mt-5 max-w-md text-base leading-relaxed">
          A premium private competition for the World Cup. Draft players, make
          predictions, place bets, and compete with your friends.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full min-w-[160px] sm:w-auto">
              Sign in
            </Button>
          </Link>
          {ownerExists ? (
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full min-w-[160px] sm:w-auto">
                Create account
              </Button>
            </Link>
          ) : (
            <Link href="/create-owner">
              <Button variant="secondary" size="lg" className="w-full min-w-[160px] sm:w-auto">
                Create Owner Account
              </Button>
            </Link>
          )}
        </div>

        {!ownerExists && (
          <p className="mt-8 text-sm text-[#0066FF]/80">
            First time setup: create the Owner account to initialize the platform.
          </p>
        )}
      </div>
    </div>
  );
}
