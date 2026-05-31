export type { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  teamName: string;
  selectedNation: string;
  role: "OWNER" | "USER";
  profilePicture?: string | null;
}
