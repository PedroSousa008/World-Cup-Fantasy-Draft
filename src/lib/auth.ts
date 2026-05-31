import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: UserRole;
      teamName: string | null;
      nation: string | null;
      profilePicture: string | null;
    };
  }

  interface User {
    role: UserRole;
    username: string;
    teamName: string | null;
    nation: string | null;
    profilePicture: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    username: string;
    teamName: string | null;
    nation: string | null;
    profilePicture: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          teamName: user.teamName,
          nation: user.nation,
          profilePicture: user.profilePicture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.username = user.username;
        token.teamName = user.teamName;
        token.nation = user.nation;
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.teamName = token.teamName;
      session.user.nation = token.nation;
      session.user.profilePicture = token.profilePicture;
      return session;
    },
  },
});
