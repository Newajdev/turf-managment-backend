import { z } from "zod";

const createBookingSchema = z.object({
  date: z.string({ message: "Date is required" }),
  turfId: z.string({ message: "Turf ID is required" }),
  turfSlotId: z.string().optional(),
  customSlotId: z.string().optional(),
}).refine((data) => data.turfSlotId || data.customSlotId, {
  message: "Either turfSlotId or customSlotId must be provided",
  path: ["turfSlotId"],
});

const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
});

export const BookingValidations = {
  createBookingSchema,
  updateBookingStatusSchema,
};
