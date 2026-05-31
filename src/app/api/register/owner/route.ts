import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerOwnerSchema } from "@/lib/validations/auth";
import { getPlatformSettings } from "@/lib/platform";

export async function POST(request: Request) {
  try {
    const settings = await getPlatformSettings();

    if (settings.ownerCreated) {
      return NextResponse.json(
        { error: "Owner account already exists. No additional owner accounts can be created." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = registerOwnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? "email" : "username";
      return NextResponse.json(
        { error: `A user with this ${field} already exists` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          username,
          role: "OWNER",
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });

      await tx.platformSettings.update({
        where: { id: "platform" },
        data: { ownerCreated: true },
      });

      return owner;
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create owner account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const settings = await getPlatformSettings();
  return NextResponse.json({ ownerExists: settings.ownerCreated });
}
