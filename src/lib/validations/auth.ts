import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  teamName: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name is too long"),
  nation: z
    .string()
    .min(2, "Nation is required")
    .max(50, "Nation name is too long"),
});

export const registerOwnerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;
