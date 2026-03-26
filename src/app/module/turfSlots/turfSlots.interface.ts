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
  status?: string; // CustomSlotStatus
  turfId: string;
  playerId: string;
}
