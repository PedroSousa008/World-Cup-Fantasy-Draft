export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { isOwnerCreated } from "@/lib/auth/permissions";

export default async function RegisterPage() {
  const ownerExists = await isOwnerCreated();

  if (!ownerExists) {
    redirect("/create-owner");
  }

  return (
    <AuthShell
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#0066FF] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
