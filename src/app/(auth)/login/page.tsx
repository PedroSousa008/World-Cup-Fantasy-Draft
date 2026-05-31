export const dynamic = "force-dynamic";

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { isOwnerCreated } from "@/lib/auth/permissions";

export default async function LoginPage() {
  const ownerExists = await isOwnerCreated();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
          <span>⚽</span>
          {APP_NAME}
        </Link>
      </div>
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-4 space-y-2 text-center text-sm text-slate-400">
          {ownerExists ? (
            <p>
              New here?{" "}
              <Link href="/register" className="text-emerald-400 hover:underline">
                Create an account
              </Link>
            </p>
          ) : (
            <p>
              Setting up for the first time?{" "}
              <Link href="/create-owner" className="text-amber-400 hover:underline">
                Create Owner Account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
