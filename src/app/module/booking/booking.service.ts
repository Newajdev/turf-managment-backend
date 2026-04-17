/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IBooking } from "./booking.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { BookingStatus } from "../../../generated/prisma/enums";
import { v7 as uuidv7 } from "uuid";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import { NotificationService } from "../notification/notification.service";
import { NotificationType, CustomSlotStatus } from "../../../generated/prisma/enums";
import { isTimeOverlap } from "../../utils/calculateTime";
import { sendEmail } from "../../utils/email";

const createBooking = async (userId: string, payload: IBooking) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 2. Existence Check for Regular Slots (Moved inside transaction for safety)
    if (payload.turfSlotId) {
      const turfSlot = await tx.turfSlot.findUnique({
        where: { id: payload.turfSlotId },
      });

      if (!turfSlot) {
        throw new AppError(status.NOT_FOUND, "Turf slot not found!");
      }
    }

    const bookingDate = new Date(payload.date);
    // 3. Proactive Conflict Check (Check overlap with any confirmed booking)
    // First, get the time range of the requested slot
    const requestedSlot = await tx.turfSlot.findUnique({
      where: { id: payload.turfSlotId },
      include: { slot: true },
    });

    if (!requestedSlot) {
      throw new AppError(status.NOT_FOUND, "Turf slot not found!");
    }

    const requestedRange = {
      startTime: requestedSlot.slot.startTime,
      endTime: requestedSlot.slot.endTime,
    };

    const confirmedBookings = await tx.booking.findMany({
      where: {
        date: bookingDate,
        turfId: payload.turfId,
        status: BookingStatus.CONFIRMED,
        isDeleted: false,
      },
      include: {
        turfSlot: { include: { slot: true } },
        customSlot: true,
      },
    });

    for (const cb of confirmedBookings) {
      let existingRange;
      if (cb.turfSlot) {
        existingRange = {
          startTime: cb.turfSlot.slot.startTime,
          endTime: cb.turfSlot.slot.endTime,
        };
      } else if (cb.customSlot) {
        existingRange = {
          startTime: cb.customSlot.startTime,
          endTime: cb.customSlot.endTime,
        };
      }

      if (existingRange && isTimeOverlap(requestedRange, existingRange)) {
        throw new AppError(
          status.CONFLICT,
          "This time frame overlaps with an existing confirmed booking!",
        );
      }
    }

    // 4. Create Booking
    const booking = await tx.booking.create({
      data: {
        ...payload,
        date: bookingDate,
        playerId: player.id,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        turf: true,
        turfSlot: {
          include: { slot: true },
        },
      },
    });

    const transectoinId = String(uuidv7());

    const paymentData = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.turfSlot?.price as number,
        transactionId: transectoinId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Booking for ${booking.turf.name} on ${booking.date.toDateString()}`,
            },
            unit_amount: paymentData.amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payments/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/bookings`,
    });

    const owner = await tx.turfOwner.findUnique({
      where: { id: booking.turf.ownerId },
    });

    if (owner) {
      await NotificationService.createNotification({
        title: "New Booking Received",
        message: `You have a new booking for ${booking.turf.name} on ${booking.date.toDateString()}.`,
        userId: owner.userId,
        type: NotificationType.BOOKING,
      });
    }

    // Send Confirmation Email to Player
    await sendEmail({
      to: player.email,
      subject: "Booking Confirmed - Turf Management",
      templateName: "booking-confirmation",
      templateData: {
        playerName: player.name,
        turfName: booking.turf.name,
        date: booking.date.toDateString(),
        startTime: booking.turfSlot?.slot.startTime,
        endTime: booking.turfSlot?.slot.endTime,
        price: booking.turfSlot?.price,
      },
    });

    return {
      booking,
      paymentData,
      paymentUrl: session.url,
    };
  });

  return {
    booking: result.booking,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };
};

const createBookingForCustomSlot = async (
  userId: string,
  payload: IBooking & { customSlotId: string },
) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const customSlot = await prisma.customTurfSlot.findUnique({
    where: { id: payload.customSlotId },
  });

  if (!customSlot) {
    throw new AppError(status.NOT_FOUND, "Custom slot not found!");
  }

  if(customSlot.playerId !== player.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this custom slot!");
  }

  const bookingDate = new Date(payload.date);

  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      turfId: payload.turfId,
      customSlotId: payload.customSlotId,
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(
      status.CONFLICT,
      "This custom slot is already booked for the selected date!",
    );
  }

  const booking = await prisma.booking.create({
    data: {
      date: bookingDate,
      turfId: payload.turfId,
      status: BookingStatus.PENDING,
      customSlotId: payload.customSlotId,
      playerId: player.id,
    },
    include: {
      turf: true,
      customSlot: true,
    },
  });

  return booking;

};

const makePaymentForCustomSlot = async (userId: string, bookingId: string) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      turf: true,
      customSlot: true,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found!");
  }

  if (booking.playerId !== player.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to make payment for this booking!",
    );
  }

  if (!booking.customSlot) {
    throw new AppError(
      status.BAD_REQUEST,
      "This booking does not have a custom slot!",
    );
  }
  const bookingPrice = booking.customSlot.price as number;

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        turf: true,
        customSlot: true,
      },
    });

    const transectoinId = String(uuidv7());

    const paymentData = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: bookingPrice,
        transactionId: transectoinId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Booking for ${booking.turf.name} on ${booking.date.toDateString()} (Custom Slot)`,
            },
            unit_amount: paymentData.amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payments/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/bookings`,
    });

    return {
      booking,
      paymentData,
      paymentUrl: session.url,
    };
  });

  return {
    booking: result.booking,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  }
};

const getMyBookings = async (userId: string, query: IQueryParams) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const bookingQuery = new QueryBuilder(prisma.booking as any, query, {
    searchableFields: [],
    filterableFields: ["status", "date"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ playerId: player.id })
    .include({
      turf: true,
      turfSlot: {
        include: { slot: true },
      },
      customSlot: true,
    });

  const result = await bookingQuery.execute();
  return result;
};

const getTurfBookings = async (
  userId: string,
  turfId: string,
  query: IQueryParams,
) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(
      status.FORBIDDEN,
      "Only turf owners can view turf bookings!",
    );
  }

  const turf = await prisma.turf.findUnique({
    where: { id: turfId },
  });

  if (!turf || turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this turf!");
  }

  const bookingQuery = new QueryBuilder(prisma.booking as any, query, {
    searchableFields: [],
    filterableFields: ["status", "date"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ turfId })
    .include({
      player: {
        include: { user: true },
      },
      turfSlot: {
        include: { slot: true },
      },
      customSlot: true,
    });

  const result = await bookingQuery.execute();
  return result;
};

const cancelBooking = async (userId: string, bookingId: string) => {
  const player = await prisma.player.findUnique({ where: { userId } });
  const owner = await prisma.turfOwner.findUnique({ where: { userId } });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { turf: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found!");
  }

  const isPlayerOwner = player && booking.playerId === player.id;
  const isTurfOwner = owner && booking.turf.ownerId === owner.id;

  if (!isPlayerOwner && !isTurfOwner) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to cancel this booking!",
    );
  }

  const now = new Date();
  const bookingDate = new Date(booking.date);
  const timeDifferenceInHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (isPlayerOwner && timeDifferenceInHours < 24) {
    throw new AppError(
      status.BAD_REQUEST,
      "Bookings can only be cancelled at least 24 hours in advance.",
    );
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status: BookingStatus.CANCELLED,
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: { turf: true }
  });

  // Notify Player
  await NotificationService.createNotification({
    title: "Booking Cancelled",
    message: `Your booking for ${result.turf.name} on ${result.date.toDateString()} has been cancelled.`,
    userId: userId,
    type: NotificationType.BOOKING
  });

  // Notify Owner
  const turfOwner = await prisma.turfOwner.findUnique({ where: { id: result.turf.ownerId } });
  if (turfOwner) {
    await NotificationService.createNotification({
      title: "Booking Cancelled by Player",
      message: `The booking for ${result.turf.name} on ${result.date.toDateString()} has been cancelled.`,
      userId: turfOwner.userId,
      type: NotificationType.BOOKING
    });
  }

  return result;
};

const rejectBooking = async (userId: string, bookingId: string) => {
  const owner = await prisma.turfOwner.findUnique({ where: { userId } });

  if (!owner) {
    throw new AppError(status.FORBIDDEN, "Only turf owners can reject bookings!");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { turf: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found!");
  }

  if (booking.turf.ownerId !== owner.id) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to reject this booking!");
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status: BookingStatus.REJECTED,
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: { player: true, turf: true, customSlot: true }
  });

  // If custom slot, update its status too
  if (result.customSlotId) {
    await prisma.customTurfSlot.update({
      where: { id: result.customSlotId },
      data: { status: CustomSlotStatus.REJECTED }
    });
  }

  // Notify Player
  await NotificationService.createNotification({
    title: "Booking Rejected",
    message: `Your booking for ${result.turf.name} on ${result.date.toDateString()} was rejected by the owner.`,
    userId: result.player.userId,
    type: NotificationType.BOOKING
  });

  return result;
};

const acceptBooking = async (userId: string, bookingId: string) => {
  const owner = await prisma.turfOwner.findUnique({ where: { userId } });

  if (!owner) {
    throw new AppError(status.FORBIDDEN, "Only turf owners can accept bookings!");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { 
      turf: true, 
      customSlot: true,
      player: true,
      turfSlot: { include: { slot: true } }
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found!");
  }

  if (booking.turf.ownerId !== owner.id) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to accept this booking!");
  }

  // Conflict Check Logic
  const requestedRange = booking.customSlot 
    ? { startTime: booking.customSlot.startTime, endTime: booking.customSlot.endTime }
    : { startTime: booking.turfSlot?.slot.startTime as string, endTime: booking.turfSlot?.slot.endTime as string };

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      date: booking.date,
      turfId: booking.turfId,
      status: BookingStatus.CONFIRMED,
      isDeleted: false,
      NOT: { id: bookingId }
    },
    include: {
      turfSlot: { include: { slot: true } },
      customSlot: true,
    },
  });

  for (const cb of confirmedBookings) {
    let existingRange;
    if (cb.turfSlot) {
      existingRange = { startTime: cb.turfSlot.slot.startTime, endTime: cb.turfSlot.slot.endTime };
    } else if (cb.customSlot) {
      existingRange = { startTime: cb.customSlot.startTime, endTime: cb.customSlot.endTime };
    }

    if (existingRange && isTimeOverlap(requestedRange, existingRange)) {
      throw new AppError(status.CONFLICT, "This booking overlaps with an existing confirmed booking!");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    if (booking.customSlotId) {
      await tx.customTurfSlot.update({
        where: { id: booking.customSlotId },
        data: { 
          status: CustomSlotStatus.ACCEPTED,
          isBooked: true 
        }
      });
    }

    return updatedBooking;
  });

  // Notify Player
  await NotificationService.createNotification({
    title: "Booking Accepted",
    message: `Your booking for ${booking.turf.name} on ${booking.date.toDateString()} has been accepted!`,
    userId: booking.player?.userId || booking.playerId,
    type: NotificationType.BOOKING
  });

  // Send Confirmation Email to Player
  await sendEmail({
    to: booking.player?.email,
    subject: "Booking Approved - Turf Management",
    templateName: "booking-confirmation",
    templateData: {
      playerName: booking.player?.name,
      turfName: booking.turf.name,
      date: booking.date.toDateString(),
      startTime: requestedRange.startTime,
      endTime: requestedRange.endTime,
      price: booking.customSlot?.price || booking.turfSlot?.price,
    },
  });

  return result;
};

const getAllBookings = async (query: IQueryParams) => {
  const bookingQuery = new QueryBuilder(prisma.booking as any, query, {
    searchableFields: ["turf.name", "player.name"],
    filterableFields: ["status", "date"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      player: {
        include: { user: true },
      },
      turf: true,
      turfSlot: {
        include: { slot: true },
      },
      customSlot: true,
    });

  const result = await bookingQuery.execute();
  return result;
};

export const BookingService = {
  createBooking,
  makePaymentForCustomSlot,
  createBookingForCustomSlot,
  getMyBookings,
  getTurfBookings,
  cancelBooking,
  rejectBooking,
  acceptBooking,
  getAllBookings,
};
