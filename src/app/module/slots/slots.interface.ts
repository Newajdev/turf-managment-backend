import { SlotType } from "../../../generated/prisma/enums";

export interface IMasterSlot {
  slotType: SlotType;
  startTime: string;
  endTime: string;
  duration?: number;
}

export interface ICreateMasterSlotPayload {
  slotType: SlotType;
  startTime: string;
  endTime: string;
  interval?: number;
}
