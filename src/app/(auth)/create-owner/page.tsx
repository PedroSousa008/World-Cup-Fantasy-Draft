export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { OwnerRegisterForm } from "@/components/auth/owner-register-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { isOwnerCreated } from "@/lib/auth/permissions";

export default async function CreateOwnerPage() {
  const ownerExists = await isOwnerCreated();

  if (ownerExists) {
    redirect("/login");
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
      <OwnerRegisterForm />
    </AuthShell>
  );
}
