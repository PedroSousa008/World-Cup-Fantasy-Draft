import { Trophy } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ownerExists } from "@/lib/platform";

export default async function LoginPage() {
  const hasOwner = await ownerExists();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Trophy className="h-12 w-12 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">World Cup Fantasy Draft</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to your account
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <LoginForm showOwnerRegister={!hasOwner} />
        </div>
      </div>
    </div>
  );
}
