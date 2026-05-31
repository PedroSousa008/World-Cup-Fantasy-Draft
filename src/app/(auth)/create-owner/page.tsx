export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { OwnerRegisterForm } from "@/components/auth/owner-register-form";
import { APP_NAME } from "@/lib/constants";
import { isOwnerCreated } from "@/lib/auth/permissions";

export default async function CreateOwnerPage() {
  const ownerExists = await isOwnerCreated();

  if (ownerExists) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
          <span>⚽</span>
          {APP_NAME}
        </Link>
      </div>
      <div className="w-full max-w-md">
        <OwnerRegisterForm />
      </div>
    </div>
  );
}
