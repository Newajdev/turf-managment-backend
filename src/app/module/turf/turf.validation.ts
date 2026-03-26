import { z } from "zod";
import { TurfStatus, WeeklyOffDay } from "../../../generated/prisma/enums";

const createTurfSchema = z.object({
  name: z.string({ message: "Turf name is required" }),
  address: z.string({ message: "Address is required" }),
  description: z.string().optional(),
  images: z.array(z.string()).min(3, "At least one image is required").optional(),
  contactNumber: z.array(z.string()).min(1, "At least one contact number is required").optional(),
  emailAddress: z.string().email("Invalid email address").optional().nullable(),
  openingTime: z.string({ message: "Opening time is required" }),
  closingTime: z.string({ message: "Closing time is required" }),
  weeklyOffDays: z.array(z.nativeEnum(WeeklyOffDay)).optional().default([]),
  isAlwaysOpen: z.boolean().optional().default(false),
  hourlyRate: z.number({ message: "Hourly rate is required" }).min(0),
  isVerifiedEmail: z.boolean().optional(),
  turfStatus: z.nativeEnum(TurfStatus).optional(),
  sportsTypes: z.array(z.string()).optional(),
  turfSlots: z.array(z.object({
    slotId: z.string(),
    price: z.number().min(0),
  })).optional(),
});

const updateTurfSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  contactNumber: z.array(z.string()).optional(),
  emailAddress: z.string().email("Invalid email address").optional().nullable(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  weeklyOffDays: z.array(z.nativeEnum(WeeklyOffDay)).optional(),
  isAlwaysOpen: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional(),
  isVerifiedEmail: z.boolean().optional(),
  turfStatus: z.nativeEnum(TurfStatus).optional(),
  maintenanceDetails: z.object({
    startDateTime: z.string().or(z.date()),
    endDateTime: z.string().or(z.date()),
    notice: z.string(),
  }).optional(),
  sportsTypes: z.array(z.string()).optional(),
  turfSlots: z.array(z.object({
    slotId: z.string(),
    price: z.number().min(0),
  })).optional(),
});

export const TurfValidations = {
  createTurfSchema,
  updateTurfSchema,
};
