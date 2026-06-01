"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { assertOwner } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const MAX_LOGO_BYTES = 512 * 1024;
const MAX_ICON_BYTES = 256 * 1024;

const brandingSchema = z.object({
  appName: z.string().min(2).max(60).optional(),
  appShortName: z.string().min(2).max(20).optional(),
  appLogoUrl: z.string().nullable().optional(),
  appIconUrl: z.string().nullable().optional(),
});

function validateDataUrl(value: string | null | undefined, maxBytes: number) {
  if (!value) return null;
  if (!value.startsWith("data:image/")) {
    throw new Error("Invalid image format");
  }
  const base64 = value.split(",")[1];
  if (!base64) throw new Error("Invalid image data");
  const bytes = Math.ceil((base64.length * 3) / 4);
  if (bytes > maxBytes) {
    throw new Error(`Image too large (max ${Math.round(maxBytes / 1024)}KB)`);
  }
  return value;
}

export async function updateAppBranding(input: z.infer<typeof brandingSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await assertOwner(session.user.id);

  const data = brandingSchema.parse(input);

  await prisma.platformSettings.update({
    where: { id: "platform" },
    data: {
      ...(data.appName !== undefined && { appName: data.appName }),
      ...(data.appShortName !== undefined && { appShortName: data.appShortName }),
      ...(data.appLogoUrl !== undefined && {
        appLogoUrl: validateDataUrl(data.appLogoUrl, MAX_LOGO_BYTES),
      }),
      ...(data.appIconUrl !== undefined && {
        appIconUrl: validateDataUrl(data.appIconUrl, MAX_ICON_BYTES),
      }),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/owner");
  revalidatePath("/login");
  revalidatePath("/register");

  return { success: true };
}
