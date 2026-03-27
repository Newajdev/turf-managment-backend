import { z } from "zod";

const createReportSchema = z.object({
  reason: z.enum([
    "MISLEADING_INFORMATION",
    "BAD_SERVICE",
    "SAFETY_CONCERNS",
    "UNHYGIENIC",
    "OVERPRICED",
    "OTHER",
  ]),
  description: z.string({ message: "Description is required" }).min(10, "Description must be at least 10 characters long"),
  turfId: z.string({ message: "Turf ID is required" }),
});

export const ReportValidations = {
  createReportSchema,
};
