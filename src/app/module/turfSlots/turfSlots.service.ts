import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { ICustomTurfSlot, ITurfSlot } from "./turfSlots.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const calculateDurationInMinutes = (start: string, end: string) => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  
  if (duration <= 0) {
    duration += 24 * 60;
  }
  
  return duration;
};

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
      ...payload,
      duration,
      price,
      playerId: player.id,
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

export const TurfSlotsService = {
  createTurfSlot,
  createCustomTurfSlot,
  getRegularSlotsByTurf,
  getCustomSlotsByPlayer,
  deleteTurfSlot,
};
