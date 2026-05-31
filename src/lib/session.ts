import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireOwner() {
  const session = await requireAuth();
  if (session.user.role !== "OWNER") {
    redirect("/my-team");
  }
  return session;
}

export async function requireUser() {
  const session = await requireAuth();
  if (session.user.role !== "USER") {
    redirect("/owner");
  }
  return session;
}

export function isOwner(session: { user: { role: string } }) {
  return session.user.role === "OWNER";
}
