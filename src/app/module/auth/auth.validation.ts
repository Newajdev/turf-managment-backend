import { z } from "zod";

const registerPlayerSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.string({ message: "Email is required" }).email(),
  password: z.string({ message: "Password is required" }).min(6).max(15),
  contactNumber: z.string().optional(),
  profilePhoto: z.string().optional(),
});

const createTurfOwnerSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.string({ message: "Email is required" }).email(),
  password: z.string({ message: "Password is required" }).min(6).max(15),
  contactNumber: z.string().optional(),
  profilePhoto: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string({ message: "Email is required" }).email(),
  password: z.string({ message: "Password is required" }),
});

const changePasswordSchema = z.object({
  currentPassword: z.string({ message: "Current password is required" }),
  newPassword: z.string({ message: "New password is required" }).min(6).max(15),
  revokeOtherSessions: z.boolean().optional(),
});

const forgetPasswordSchema = z.object({
  email: z.string({ message: "Email is required" }).email(),
});

export const AuthValidations = {
  registerPlayerSchema,
  createTurfOwnerSchema,
  loginSchema,
  changePasswordSchema,
  forgetPasswordSchema,
};
