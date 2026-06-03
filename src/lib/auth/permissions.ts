import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getPlatformSettings() {
  let settings = await prisma.platformSettings.findUnique({
    where: { id: "platform" },
  });

  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: "platform" },
    });
  }

  return settings;
}

export async function isOwnerCreated(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.ownerCreated;
}

export async function getOwnerUser() {
  const settings = await getPlatformSettings();
  if (!settings.ownerId) return null;

  return prisma.user.findUnique({
    where: { id: settings.ownerId },
    select: {
      id: true,
      username: true,
      email: true,
      teamName: true,
      selectedNation: true,
      role: true,
    },
  });
}

export async function assertOwner(userId: string): Promise<void> {
  const settings = await getPlatformSettings();

  if (!settings.ownerCreated || settings.ownerId !== userId) {
    throw new Error("Unauthorized: Owner access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== UserRole.OWNER) {
    throw new Error("Unauthorized: Owner role required");
  }
}

export async function assertAuthenticated(userId: string | undefined): Promise<string> {
  if (!userId) {
    throw new Error("Unauthorized: Authentication required");
  }
  return userId;
}

export function isOwnerRole(role: UserRole | string | undefined): boolean {
  return role === UserRole.OWNER;
}

/** True only for the single platform Owner account (role + platformSettings.ownerId). */
export async function isPlatformOwner(userId: string): Promise<boolean> {
  const settings = await getPlatformSettings();
  if (!settings.ownerCreated || settings.ownerId !== userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.OWNER;
}
