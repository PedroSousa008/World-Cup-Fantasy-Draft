"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  showOwnerRegister?: boolean;
}

export function LoginForm({ showOwnerRegister = false }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.refresh();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>

      <div className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-pitch-400 hover:text-pitch-300">
          Create account
        </Link>
      </div>

      {showOwnerRegister && (
        <div className="border-t border-zinc-800 pt-4 text-center">
          <Link
            href="/register/owner"
            className="text-sm text-gold-400 hover:text-gold-300"
          >
            Create Owner Account (one-time setup)
          </Link>
        </div>
      )}
    </form>
  );
}
