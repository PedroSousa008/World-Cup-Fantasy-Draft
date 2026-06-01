"use server";

import { auth } from "@/lib/auth";
import { assertOwner } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";

export type OwnerActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function requireOwnerSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== UserRole.OWNER) return null;
  try {
    await assertOwner(session.user.id);
  } catch {
    return null;
  }
  return session.user;
}
