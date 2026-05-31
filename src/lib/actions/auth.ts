"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import {
  ownerRegisterSchema,
  userRegisterSchema,
  type LoginInput,
  type OwnerRegisterInput,
  type UserRegisterInput,
} from "@/lib/validations/auth";
import { getPlatformSettings } from "@/lib/auth/permissions";

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(data: LoginInput): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function registerOwnerAction(
  data: OwnerRegisterInput
): Promise<ActionResult> {
  const parsed = ownerRegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const settings = await getPlatformSettings();
  if (settings.ownerCreated) {
    return {
      success: false,
      error: "An owner account already exists. Owner registration is permanently closed.",
    };
  }

  const { email, password, username, teamName, selectedNation } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    },
  });

  if (existingUser) {
    return {
      success: false,
      error:
        existingUser.email === email.toLowerCase()
          ? "An account with this email already exists"
          : "This username is already taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const currentSettings = await tx.platformSettings.findUnique({
        where: { id: "platform" },
      });

      if (currentSettings?.ownerCreated) {
        throw new Error("Owner already exists");
      }

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          username,
          teamName,
          selectedNation,
          role: UserRole.OWNER,
        },
      });

      await tx.platformSettings.upsert({
        where: { id: "platform" },
        create: {
          id: "platform",
          ownerCreated: true,
          ownerId: user.id,
        },
        update: {
          ownerCreated: true,
          ownerId: user.id,
        },
      });

      await tx.fantasyTeam.create({
        data: { userId: user.id },
      });
    });
  } catch {
    return {
      success: false,
      error: "Owner account could not be created. It may already exist.",
    };
  }

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function registerUserAction(
  data: UserRegisterInput
): Promise<ActionResult> {
  const parsed = userRegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const settings = await getPlatformSettings();
  if (!settings.ownerCreated) {
    return {
      success: false,
      error: "The platform is not yet set up. An owner account must be created first.",
    };
  }

  const { email, password, username, teamName, selectedNation } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    },
  });

  if (existingUser) {
    return {
      success: false,
      error:
        existingUser.email === email.toLowerCase()
          ? "An account with this email already exists"
          : "This username is already taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        username,
        teamName,
        selectedNation,
        role: UserRole.USER,
      },
    });

    await tx.fantasyTeam.create({
      data: { userId: user.id },
    });
  });

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function checkOwnerStatusAction(): Promise<{
  ownerCreated: boolean;
}> {
  const settings = await getPlatformSettings();
  return { ownerCreated: settings.ownerCreated };
}
