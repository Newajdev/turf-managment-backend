import { CustomSlotStatus } from "../../../generated/prisma/enums";

export interface ITurfSlot {
  price: number;
  isBooking?: boolean;
  turfId: string;
  slotId: string;
}

export interface ICustomTurfSlot {
  startTime: string;
  endTime: string;
  duration?: number;
  price?: number;
  isBooked?: boolean;
  status?: CustomSlotStatus;
  turfId: string;
  playerId: string;
}
export interface IBulkTurfSlot {
  turfId: string;
  slotIds: string[];
  price: number;
}
