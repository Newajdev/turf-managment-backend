import { addMinutes, differenceInMinutes, format,  addDays } from "date-fns";
import { prisma } from "../../lib/prisma";
import { ICreateMasterSlotPayload, IMasterSlot } from "./slots.interface";
import AppError from "../../errorHelpers/AppError";
import { parseTime } from "./slot.utils";
import status from "http-status";


const createMasterSlot = async (payload: ICreateMasterSlotPayload) => {
  const { startTime, endTime, slotType, interval } = payload;

  const results = [];

  const referenceDate = new Date();
  const start = parseTime(startTime, referenceDate);
  let end = parseTime(endTime, referenceDate);

  if (!start || !end) {
    throw new AppError(400, "Invalid time format. Please use 'HH:mm' or 'hh:mm AM/PM'.");
  }

  if (end < start) {
    end = addDays(end, 1);
  }

  if (interval) {
    let currentStart = start;
    while (currentStart < end) {
      const nextEnd = addMinutes(currentStart, interval);

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
  const result = await prisma.masterSlot.findUnique({
    where: { id },
  });
  if (!result) {
    throw new AppError(status.NOT_FOUND, "Slot Not Found")
  }
  return result;
};

const updateMasterSlot = async (id: string, payload: Partial<IMasterSlot>) => {
  const { startTime, endTime } = payload;

  const existingSlot = await prisma.masterSlot.findUnique({
    where: { id },
  });

  if (!existingSlot) {
    throw new AppError(status.NOT_FOUND, "Slot Not Found")
  }

  if (startTime || endTime) {

    const duplicateSlot = await prisma.masterSlot.findUnique({
      where: {
        uniqe_start_end_time: {
          startTime: startTime as string,
          endTime: endTime as string
        }
      },
    });

    if (duplicateSlot && duplicateSlot.id !== id) {
      throw new AppError(status.BAD_REQUEST, "Slot Already Exists");
    }

    const referenceDate = new Date();
    const start = parseTime(startTime as string, referenceDate);
    let end = parseTime(endTime as string, referenceDate);

    if (!start || !end) {
      throw new AppError(400, "Invalid time format. Please use 'HH:mm' or 'hh:mm AM/PM'.");
    }

    if (end < start) {
      end = addDays(end, 1);
    }

    payload.duration = differenceInMinutes(end, start);
  }

  const result = await prisma.masterSlot.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteMasterSlot = async (id: string) => {
  const existingSlot = await prisma.masterSlot.findUnique({
    where: { id },
  });

  if (!existingSlot) {
    throw new AppError(status.NOT_FOUND, "Slot Not Found")
  }
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
