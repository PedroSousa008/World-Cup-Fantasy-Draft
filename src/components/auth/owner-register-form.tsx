"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { registerOwnerAction } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { NATIONS } from "@/lib/constants";
import { Shield } from "lucide-react";

export function OwnerRegisterForm() {
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
    const result = await registerOwnerAction({
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
      setError(result.error ?? "Owner registration failed");
      return;
    }

    router.push("/owner");
    router.refresh();
  }

  const nationOptions = NATIONS.map((n) => ({ value: n, label: n }));

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Create Owner Account
        </span>
      }
      description="Set up the platform administrator. This can only be done once."
    >
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Only one Owner account can ever exist. Once created, this option disappears
        permanently.
      </div>
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
          placeholder="owner@example.com"
        />
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          required
          error={fieldErrors.username?.[0]}
          placeholder="commissioner"
        />
        <Input
          label="Team Name"
          name="teamName"
          required
          error={fieldErrors.teamName?.[0]}
          placeholder="Commissioner's XI"
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
          Create Owner Account
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
