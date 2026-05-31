export const USER_ROLE = {
  OWNER: "OWNER",
  USER: "USER",
} as const;

export type AppUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
