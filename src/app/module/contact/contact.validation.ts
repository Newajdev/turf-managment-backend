import { z } from "zod";

const createContactSchema = z.object({
  body: z.object({
    name: z.string({}).min(2, "Name must be at least 2 characters").optional(),
    email: z.string({}).email("Invalid email address").optional(),
    subject: z.string({}).min(5, "Subject must be at least 5 characters").optional(),
    message: z.string({}).min(10, "Message must be at least 10 characters").optional(),
  }),
});

export const ContactValidation = {
  createContactSchema,
};
