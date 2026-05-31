import { Trophy } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Trophy className="h-12 w-12 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join the Competition</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create your team and pick your nation
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
