"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Shield } from "lucide-react";

export function RegisterOwnerForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
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
      const res = await fetch("/api/register/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create owner account");
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
      router.push("/owner");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
        <Shield className="h-5 w-5 shrink-0" />
        <p>
          This creates the one and only Owner account. Once created, this
          option will permanently disappear.
        </p>
      </div>

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
        placeholder="owner@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Username"
        type="text"
        value={form.username}
        onChange={(e) => updateField("username", e.target.value)}
        placeholder="game_master"
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

      <Button type="submit" variant="gold" className="w-full" isLoading={isLoading}>
        Create Owner Account
      </Button>

      <div className="text-center text-sm text-zinc-400">
        <Link href="/login" className="text-pitch-400 hover:text-pitch-300">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
