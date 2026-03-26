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

export interface ITurf {
  name: string;
  address: string;
  description?: string;
  images: string[];
  contactNumber: string[];
  emailAddress?: string | null;
  openingTime: string;
  closingTime: string;
  weeklyOffDays: WeeklyOffDay[];
  isAlwaysOpen?: boolean;
  hourlyRate: number;
  isVerifiedEmail?: boolean;
  turfStatus?: TurfStatus;
  maintenanceDetails?: ITurfMaintenancePayload;
  sportsTypes?: string[];
}
