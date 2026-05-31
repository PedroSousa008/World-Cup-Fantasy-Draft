export type { UserRole } from "@prisma/client";

export interface NavItem {
  href: string;
  label: string;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: "OWNER" | "USER";
  teamName: string | null;
  nation: string | null;
  profilePicture: string | null;
}
