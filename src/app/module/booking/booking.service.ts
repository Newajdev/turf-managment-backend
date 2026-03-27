import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IBooking } from "./booking.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const createBooking = async (userId: string, payload: IBooking) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  // 1. Ownership & Existence Check for Custom Slots
  if (payload.customSlotId) {
    const customSlot = await prisma.customTurfSlot.findUnique({
      where: { id: payload.customSlotId },
    });

    if (!customSlot) {
      throw new AppError(status.NOT_FOUND, "Custom slot not found!");
    }

    if (customSlot.playerId !== player.id) {
      throw new AppError(status.FORBIDDEN, "You can only book custom slots created by yourself!");
    }
  }

  // 2. Existence Check for Regular Slots
  if (payload.turfSlotId) {
    const turfSlot = await prisma.turfSlot.findUnique({
      where: { id: payload.turfSlotId },
    });

    if (!turfSlot) {
      throw new AppError(status.NOT_FOUND, "Turf slot not found!");
    }
  }

  // 3. Availability Check
  const bookingDate = new Date(payload.date);
  
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      turfId: payload.turfId,
      OR: [
        { turfSlotId: payload.turfSlotId },
        { customSlotId: payload.customSlotId },
      ],
      status: {
         notIn: ['CANCELLED', 'REJECTED'],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(status.CONFLICT, "This slot is already booked for the selected date!");
  }

  // 4. Create Booking
  const result = await prisma.booking.create({
    data: {
      ...payload,
      date: bookingDate,
      playerId: player.id,
    },
    include: {
      turf: true,
      turfSlot: {
        include: { slot: true },
      },
      customSlot: true,
    },
  });

  return result;
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

const getTurfBookings = async (userId: string, turfId: string, query: IQueryParams) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
     throw new AppError(status.FORBIDDEN, "Only turf owners can view turf bookings!");
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
        include: { user: true }
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
    // Determine if requester is player or owner
    const player = await prisma.player.findUnique({ where: { userId } });
    const owner = await prisma.turfOwner.findUnique({ where: { userId } });

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { turf: true }
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found!");
    }

    const isPlayerOwner = player && booking.playerId === player.id;
    const isTurfOwner = owner && booking.turf.ownerId === owner.id;

    if (!isPlayerOwner && !isTurfOwner) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to cancel this booking!");
    }

    const result = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
    });

    return result;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getTurfBookings,
  cancelBooking
};
