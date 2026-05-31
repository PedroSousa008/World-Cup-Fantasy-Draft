import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerUserSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, username, teamName, nation } = parsed.data;
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

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        username,
        teamName,
        nation,
        role: "USER",
        fantasyTeam: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        teamName: true,
        nation: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
