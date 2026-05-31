export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { RegisterOwnerForm } from "@/components/auth/RegisterOwnerForm";
import { ownerExists } from "@/lib/platform";

export default async function RegisterOwnerPage() {
  const hasOwner = await ownerExists();

  if (hasOwner) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-12 w-12 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Owner Setup</h1>
          <p className="mt-2 text-sm text-zinc-400">
            One-time platform administrator account
          </p>
        </div>

        <div className="rounded-xl border border-gold-500/20 bg-zinc-900/50 p-6">
          <RegisterOwnerForm />
        </div>
      </div>
    </div>
  );
}
