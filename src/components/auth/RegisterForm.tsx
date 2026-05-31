"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const NATIONS = [
  "Argentina", "Australia", "Belgium", "Brazil", "Canada", "Colombia",
  "Croatia", "Denmark", "England", "France", "Germany", "Ghana",
  "Italy", "Japan", "Mexico", "Morocco", "Netherlands", "Nigeria",
  "Poland", "Portugal", "Senegal", "South Korea", "Spain", "Switzerland",
  "Uruguay", "USA", "Other",
].map((n) => ({ value: n, label: n }));

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    teamName: "",
    nation: "Portugal",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.refresh();
      router.push("/my-team");
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
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Username"
        type="text"
        value={form.username}
        onChange={(e) => updateField("username", e.target.value)}
        placeholder="pedro_fc"
        required
        autoComplete="username"
      />

      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => updateField("password", e.target.value)}
        placeholder="Min. 8 characters"
        required
        autoComplete="new-password"
      />

      <Input
        label="Team Name"
        type="text"
        value={form.teamName}
        onChange={(e) => updateField("teamName", e.target.value)}
        placeholder="Pedro FC"
        required
      />

      <Select
        label="Nation"
        value={form.nation}
        onChange={(e) => updateField("nation", e.target.value)}
        options={NATIONS}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create Account
      </Button>

      <div className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-pitch-400 hover:text-pitch-300">
          Sign in
        </Link>
      </div>
    </form>
  );
}
