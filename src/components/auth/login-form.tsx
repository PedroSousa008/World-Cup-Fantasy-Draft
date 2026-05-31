"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Login failed");
      return;
    }

    router.push("/my-team");
    router.refresh();
  }

  return (
    <Card title="Sign in" description={`Welcome back to ${APP_NAME}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-[#E53935]/25 bg-[#E53935]/8 px-4 py-3 text-sm text-[#E53935]">
            {error}
          </div>
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
    </Card>
  );
}
