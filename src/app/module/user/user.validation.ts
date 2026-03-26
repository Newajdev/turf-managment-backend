import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z.string().optional(),
});

const blockUserSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]),
});

export const UserValidations = {
  updateUserSchema,
  blockUserSchema,
};
