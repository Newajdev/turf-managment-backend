import { addMinutes, differenceInMinutes, parse, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { ICreateMasterSlotPayload, IMasterSlot } from "./slots.interface";

const createMasterSlot = async (payload: ICreateMasterSlotPayload) => {
  const { startTime, endTime, slotType, interval } = payload;

  const results = [];

  // Use a fixed date for parsing times to calculate duration within a single day
  const referenceDate = new Date();
  const start = parse(startTime, "hh:mm a", referenceDate);
  const end = parse(endTime, "hh:mm a", referenceDate);

  if (interval) {
    let currentStart = start;
    while (currentStart < end) {
      const nextEnd = addMinutes(currentStart, interval);

      // Stop if next interval exceeds the end time
      if (nextEnd > end) break;

      const slotStartTime = format(currentStart, "hh:mm a");
      const slotEndTime = format(nextEnd, "hh:mm a");

      const result = await prisma.masterSlot.create({
        data: {
          slotType,
          startTime: slotStartTime,
          endTime: slotEndTime,
          duration: interval,
        },
      });
      results.push(result);
      currentStart = nextEnd;
    }
  } else {
    const duration = differenceInMinutes(end, start);

    const result = await prisma.masterSlot.create({
      data: {
        slotType,
        startTime,
        endTime,
        duration,
      },
    });
    results.push(result);
  }

  return results.length === 1 ? results[0] : results;
};

const getAllMasterSlots = async () => {
  const result = await prisma.masterSlot.findMany();
  return result;
};

const getSingleMasterSlot = async (id: string) => {
  const result = await prisma.masterSlot.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const updateMasterSlot = async (id: string, payload: Partial<IMasterSlot>) => {
  const { startTime, endTime } = payload;

  if (startTime || endTime) {
    const existingSlot = await prisma.masterSlot.findUniqueOrThrow({
      where: { id },
    });

    const newStartTime = startTime || existingSlot.startTime;
    const newEndTime = endTime || existingSlot.endTime;

    const referenceDate = new Date();
    const start = parse(newStartTime, "hh:mm a", referenceDate);
    const end = parse(newEndTime, "hh:mm a", referenceDate);
    
    payload.duration = differenceInMinutes(end, start);
  }

  const result = await prisma.masterSlot.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteMasterSlot = async (id: string) => {
  const result = await prisma.masterSlot.delete({
    where: { id },
  });
  return result;
};

export const MasterSlotService = {
  createMasterSlot,
  getAllMasterSlots,
  getSingleMasterSlot,
  updateMasterSlot,
  deleteMasterSlot,
};
