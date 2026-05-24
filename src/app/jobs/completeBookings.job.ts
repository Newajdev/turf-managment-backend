import { prisma } from "../lib/prisma";
import {
  BookingStatus,
  NotificationType,
  PaymentStatus,
} from "../../generated/prisma/enums";
import { getBookingEndDateTime } from "../utils/bookingDateTime.util";
import { NotificationService } from "../module/notification/notification.service";

/**
 * Marks paid, confirmed bookings as COMPLETED after the slot end time has passed.
 * Enables review eligibility.
 */
export const completePastBookings = async (): Promise<number> => {
  const now = new Date();
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const candidates = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      isDeleted: false,
      date: { lte: today },
    },
    include: {
      player: true,
      turfSlot: { include: { slot: true } },
      customSlot: true,
    },
  });

  let completedCount = 0;

  for (const booking of candidates) {
    const endDateTime = getBookingEndDateTime(
      booking.date,
      booking.turfSlot,
      booking.customSlot,
    );

    if (!endDateTime || endDateTime >= now) {
      continue;
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED },
    });

    if (booking.player?.userId) {
      NotificationService.createNotification({
        title: "Rate your experience",
        message: "Your booking has ended. Share a review for your turf experience!",
        userId: booking.player.userId,
        type: NotificationType.BOOKING,
      }).catch((err) => console.error("Completion notification error:", err));
    }

    completedCount++;
  }


  return completedCount;
};
