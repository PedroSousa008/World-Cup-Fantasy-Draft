export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOwnerCreated } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/my-team");
  }

  const ownerExists = await isOwnerCreated();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 text-6xl">⚽</div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 text-slate-400">
          A private fantasy competition for the World Cup. Draft players, make
          predictions, place bets, and compete with your friends.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
          {ownerExists ? (
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Create account
              </Button>
            </Link>
          ) : (
            <Link href="/create-owner">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Create Owner Account
              </Button>
            </Link>
          )}
        </div>
        {!ownerExists && (
          <p className="mt-6 text-sm text-amber-400/80">
            First time setup: create the Owner account to initialize the platform.
          </p>
        )}
      </div>
    </div>
  );
}
