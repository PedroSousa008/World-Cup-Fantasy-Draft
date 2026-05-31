import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ownerRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  teamName: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(30, "Team name must be at most 30 characters"),
  selectedNation: z.string().min(2, "Please select a nation"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const userRegisterSchema = ownerRegisterSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type OwnerRegisterInput = z.infer<typeof ownerRegisterSchema>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
