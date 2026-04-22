import { TurfStatus, WeeklyOffDay } from "../../../generated/prisma/enums";

export interface ITurfMaintenancePayload {
  startDateTime: Date | string;
  endDateTime: Date | string;
  notice: string;
}

export interface ITurfSlotPayload {
  slotId: string;
  price: number;
}

export interface ITurfCreatePayload {
  name: string;
  address: string;
  description?: string;
  images?: string[];
  contactNumber?: string[];
  emailAddress?: string | null;
  openingTime: string;
  closingTime: string;
  weeklyOffDays?: WeeklyOffDay[];
  isAlwaysOpen?: boolean;
  hourlyRate: number;
  isVerifiedEmail?: boolean;
  turfStatus?: TurfStatus;
  sportsTypes?: string[];
}

export interface ITurfUpdatePayload extends Partial<ITurfCreatePayload> {
  maintenanceDetails?: ITurfMaintenancePayload;
}

// Keep ITurf for backward compatibility or as a general type if needed
export interface ITurf extends ITurfCreatePayload {
    maintenanceDetails?: ITurfMaintenancePayload;
}
