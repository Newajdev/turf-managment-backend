import { z } from "zod";

const createTurfSlotSchema = z.object({
  price: z.number().min(0),
  isBooking: z.boolean().optional(),
  turfId: z.string({ message: "Turf ID is required" }),
  slotId: z.string({ message: "Master Slot ID is required" }),
});

const createCustomTurfSlotSchema = z.object({
  startTime: z.string({ message: "Start time is required" }),
  endTime: z.string({ message: "End time is required" }),
  turfId: z.string({ message: "Turf ID is required" }),
});

const updateTurfSlotSchema = z.object({
  price: z.number().min(0).optional(),
  isBooking: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const bulkCreateTurfSlotSchema = z.object({
  turfId: z.string({ message: "Turf ID is required" }),
  slotIds: z.array(z.string()).min(1, "At least one slot ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

const updateCustomTurfSlotSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const TurfSlotValidations = {
  createTurfSlotSchema,
  createCustomTurfSlotSchema,
  updateTurfSlotSchema,
  bulkCreateTurfSlotSchema,
  updateCustomTurfSlotSchema,
};
