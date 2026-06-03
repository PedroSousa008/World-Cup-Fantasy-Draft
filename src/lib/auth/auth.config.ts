import type { NextAuthConfig } from "next-auth";
import type { AppUserRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      teamName: string;
      selectedNation: string;
      role: AppUserRole;
      profilePicture?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    teamName: string;
    selectedNation: string;
    role: AppUserRole;
    profilePicture?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string;
    teamName: string;
    selectedNation: string;
    role: AppUserRole;
    profilePicture?: string | null;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.teamName = user.teamName;
        token.selectedNation = user.selectedNation;
        token.role = user.role;
        token.profilePicture = user.profilePicture;
      }
      if (trigger === "update" && session) {
        const patch = session as {
          username?: string;
          teamName?: string;
        };
        if (patch.username) token.username = patch.username;
        if (patch.teamName) token.teamName = patch.teamName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.teamName = token.teamName;
        session.user.selectedNation = token.selectedNation;
        session.user.role = token.role;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
