"use server";

import { auth } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/auth/permissions";

export type OwnerActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function requireOwnerSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const allowed = await isPlatformOwner(session.user.id);
  if (!allowed) return null;
  return session.user;
}
