import { db } from "@/lib/db";

export async function getPlatformSettings() {
  let settings = await db.platformSettings.findUnique({
    where: { id: "platform" },
  });

  if (!settings) {
    settings = await db.platformSettings.create({
      data: { id: "platform", ownerCreated: false },
    });
  }

  return settings;
}

export async function ownerExists(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.ownerCreated;
}

export async function ensurePlatformSettings() {
  return getPlatformSettings();
}
