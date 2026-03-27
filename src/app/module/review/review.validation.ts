import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  bookingId: z.string({ message: "Booking ID is required" }),
  turfId: z.string({ message: "Turf ID is required" }),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const ReviewValidations = {
  createReviewSchema,
  updateReviewSchema,
};
