"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { registerUserAction } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { NATIONS } from "@/lib/constants";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUserAction({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      username: formData.get("username") as string,
      teamName: formData.get("teamName") as string,
      selectedNation: formData.get("selectedNation") as string,
    });

    setIsLoading(false);

    if (!result.success) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      setError(result.error ?? "Registration failed");
      return;
    }

    router.push("/my-team");
    router.refresh();
  }

  const nationOptions = NATIONS.map((n) => ({ value: n, label: n }));

  return (
    <Card
      title="Create your account"
      description="Join the competition with your team name and nation"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={fieldErrors.email?.[0]}
          placeholder="you@example.com"
        />
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          required
          error={fieldErrors.username?.[0]}
          placeholder="pedro_fc"
        />
        <Input
          label="Team Name"
          name="teamName"
          required
          error={fieldErrors.teamName?.[0]}
          placeholder="Pedro FC"
        />
        <Select
          label="Selected Nation"
          name="selectedNation"
          required
          placeholder="Choose your nation"
          options={nationOptions}
          error={fieldErrors.selectedNation?.[0]}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={fieldErrors.password?.[0]}
          placeholder="••••••••"
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={fieldErrors.confirmPassword?.[0]}
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}
