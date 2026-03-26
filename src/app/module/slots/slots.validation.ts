import { z } from "zod";

import { SlotType } from "../../../generated/prisma/enums";

const createMasterSlotSchema = z.object({
  slotType: z.nativeEnum(SlotType),
  startTime: z.string({ message: "Start time is required" }),
  endTime: z.string({ message: "End time is required" }),
  duration: z.number().optional(),
  interval: z.number().optional(),
});

const updateMasterSlotSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const MasterSlotValidations = {
  createMasterSlotSchema,
  updateMasterSlotSchema,
};
