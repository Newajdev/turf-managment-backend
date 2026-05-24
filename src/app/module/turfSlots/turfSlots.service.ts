import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { ICustomTurfSlot, ITurfSlot } from "./turfSlots.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  calculateDurationInMinutes,
  isTimeOverlap,
} from "../../utils/calculateTime";
import { BookingStatus } from "../../../generated/prisma/enums";


const createTurfSlot = async (userId: string, payload: ITurfSlot) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const turf = await prisma.turf.findUnique({
    where: { id: payload.turfId },
  });

  if (!turf || turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this Turf!");
  }

  const result = await prisma.turfSlot.create({
    data: payload,
  });

  return result;
};

const createCustomTurfSlot = async (
  userId: string,
  payload: ICustomTurfSlot,
) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const turf = await prisma.turf.findUniqueOrThrow({
    where: { id: payload.turfId },
  });

  const duration = calculateDurationInMinutes(
    payload.startTime,
    payload.endTime,
  );
  const price = (duration / 60) * Number(turf.hourlyRate);

  const result = await prisma.customTurfSlot.create({
    data: {
      startTime: payload.startTime,
      endTime: payload.endTime,
      date: new Date(payload.date),
      sportType: payload.sportType,
      playersCount: payload.playersCount,
      duration,
      price,
      playerId: player.id,
      turfId: payload.turfId,
    },
  });

  return result;
};

const getRegularSlotsByTurf = async (turfId: string, query: IQueryParams) => {
  const slotQuery = new QueryBuilder(prisma.turfSlot as any, query, {
      searchableFields: [],
      filterableFields: ["isBooking"],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .where({ turfId })
  .include({ slot: true });

  const result = await slotQuery.execute();
  return result;
};

const getAllCustomSlotsByPlayer = async (userId: string, query: IQueryParams) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const slotQuery = new QueryBuilder(prisma.customTurfSlot as any, query, {
    searchableFields: ["sportType"],
    filterableFields: ["status", "isBooked"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({
      playerId: player.id,
      isDeleted: false,
    })
    .include({ turf: true });

  const result = await slotQuery.execute();
  return result;
};

const getCustomSlotsByPlayer = async (userId: string, turfId: string, query: IQueryParams) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const slotQuery = new QueryBuilder(prisma.customTurfSlot as any, query, {
      searchableFields: [],
      filterableFields: ["isBooked"],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .where({ 
    turfId, 
    playerId: player.id 
  });

  const result = await slotQuery.execute();
  return result;
};

const deleteTurfSlot = async (userId: string, id: string) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const slot = await prisma.turfSlot.findUnique({
    where: { id },
    include: { turf: true },
  });

  if (!slot || slot.turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to delete this slot!");
  }

  await prisma.turfSlot.delete({ where: { id } });
  return null;
};

const updateCustomTurfSlot = async (
  userId: string,
  id: string,
  payload: Partial<ICustomTurfSlot>,
) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const customSlot = await prisma.customTurfSlot.findUnique({
    where: { id },
    include: { turf: true },
  });

  if (!customSlot || customSlot.playerId !== player.id) {
    throw new AppError(status.NOT_FOUND, "Custom slot not found!");
  }

  if (customSlot.isBooked) {
    throw new AppError(status.BAD_REQUEST, "Cannot update a booked slot!");
  }

  const updateData: any = { ...payload };

  // If time changes, recalculate duration and price, and reset status for resubmission
  if (payload.startTime || payload.endTime) {
    const startTime = payload.startTime || customSlot.startTime;
    const endTime = payload.endTime || customSlot.endTime;

    const duration = calculateDurationInMinutes(startTime, endTime);
    const price = (duration / 60) * Number(customSlot.turf.hourlyRate);

    updateData.duration = duration;
    updateData.price = price;
    updateData.status = "PENDING"; // Reset for owner approval
  }

  const result = await prisma.customTurfSlot.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteCustomTurfSlot = async (userId: string, id: string) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const customSlot = await prisma.customTurfSlot.findUnique({
    where: { id },
  });

  if (!customSlot || customSlot.playerId !== player.id) {
    throw new AppError(status.NOT_FOUND, "Custom slot not found!");
  }

  if (customSlot.isBooked) {
    throw new AppError(status.BAD_REQUEST, "Cannot delete a booked slot!");
  }

  const result = await prisma.customTurfSlot.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return result;
};

const bulkCreateTurfSlots = async (userId: string, payload: { turfId: string, slotIds: string[], price: number }) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const turf = await prisma.turf.findUnique({
    where: { id: payload.turfId },
  });

  if (!turf || turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this Turf!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdSlots = await Promise.all(
      payload.slotIds.map((slotId) =>
        tx.turfSlot.create({
          data: {
            turfId: payload.turfId,
            slotId: slotId,
            price: payload.price,
          },
          include: {
            slot: true
          }
        })
      )
    );
    return createdSlots;
  });

  return result;
};

const getAvailableSlots = async (turfId: string, date: string) => {
  const regularSlots = await prisma.turfSlot.findMany({
    where: { 
      turfId,
      isBooking: false // Assuming false means 'active' and available for player view
    },
    include: { slot: true },
  });

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      turfId,
      date: new Date(date),
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] // Also count pending as 'unavailable' for standard flow to prevent race conditions
      },
      isDeleted: false,
    },
    include: {
      turfSlot: true,
      customSlot: true,
    }
  });

  return regularSlots.map(ts => {
    const isBooked = confirmedBookings.some(cb => {
      if (cb.turfSlotId === ts.id) return true;
      if (cb.customSlot) {
        return isTimeOverlap(
          { startTime: ts.slot.startTime, endTime: ts.slot.endTime },
          { startTime: cb.customSlot.startTime, endTime: cb.customSlot.endTime }
        );
      }
      return false;
    });
    return { ...ts, isBooked };
  });
};

export const TurfSlotsService = {
  createTurfSlot,
  createCustomTurfSlot,
  getRegularSlotsByTurf,
  getAvailableSlots,
  getAllCustomSlotsByPlayer,
  getCustomSlotsByPlayer,
  deleteTurfSlot,
  bulkCreateTurfSlots,
  updateCustomTurfSlot,
  deleteCustomTurfSlot,
};
