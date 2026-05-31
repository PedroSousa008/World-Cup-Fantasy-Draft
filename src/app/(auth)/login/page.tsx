export const dynamic = "force-dynamic";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { isOwnerCreated } from "@/lib/auth/permissions";

export default async function LoginPage() {
  const ownerExists = await isOwnerCreated();

  return (
    <AuthShell
      footer={
        ownerExists ? (
          <p>
            New here?{" "}
            <Link href="/register" className="font-medium text-[#0066FF] hover:underline">
              Create an account
            </Link>
          </p>
        ) : (
          <p>
            Setting up for the first time?{" "}
            <Link href="/create-owner" className="font-medium text-[#0066FF] hover:underline">
              Create Owner Account
            </Link>
          </p>
        )
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
