import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { ITurf } from "./turf.interface";
import { TurfStatus, BookingStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../../../generated/prisma/enums";
import { sendEmail } from "../../utils/email";

const createTurf = async (userId: string, payload: ITurf) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const existingTurf = await prisma.turf.findUnique({
    where: { ownerId: turfOwner.id },
  });

  if (existingTurf) {
    throw new AppError(
      status.CONFLICT,
      "One Turf Owner can only create one Turf!",
    );
  }

  const { sportsTypes, ...turfData } = payload;

  const sportsTypesData = sportsTypes?.map((id) => ({ id }));

  const result = await prisma.turf.create({
    data: {
      ...turfData,
      ownerId: turfOwner.id,
      sportTypes: sportsTypesData && { connect: sportsTypesData },
    },
    include: {
      sportTypes: true,
      owner: true,
    },
  });

  return result;
};

const getAllTurfs = async (query: IQueryParams) => {
  const turfQuery = new QueryBuilder(prisma.turf as any, query, {
    searchableFields: ["name", "address"],
    filterableFields: ["turfStatus", "hourlyRate"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      owner: true,
      sportTypes: true,
    });

  const result = await turfQuery.execute();
  return result;
};

const getSingleTurf = async (id: string) => {
  const result = await prisma.turf.findUniqueOrThrow({
    where: { id },
    include: {
      owner: true,
      sportTypes: true,
      turfSlots: {
        include: {
          slot: true,
        },
      },
      reviews: true,
    },
  });
  return result;
};

const updateTurf = async (
  userId: string,
  id: string,
  payload: Partial<ITurf>,
) => {
  const { maintenanceDetails, sportsTypes, ...rest } = payload;

  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const turf = await prisma.turf.findUnique({
    where: { id },
  });

  if (!turf) {
    throw new AppError(status.NOT_FOUND, "Turf not found!");
  }

  if (turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this Turf!");
  }

  if (rest.turfStatus === TurfStatus.MAINTENANCE && maintenanceDetails) {
    await prisma.turfMaintenance.create({
      data: {
        startDateTime: new Date(maintenanceDetails.startDateTime),
        endDateTime: new Date(maintenanceDetails.endDateTime),
        notice: maintenanceDetails.notice,
        turfId: id,
      },
    });
  }

  const sportsTypesData = sportsTypes?.map((id) => ({ id }));

  const result = await prisma.turf.update({
    where: { id },
    data: {
      ...rest,
      sportTypes: sportsTypes && { connect: sportsTypesData },
    },
  });

  if (rest.turfStatus && rest.turfStatus !== turf.turfStatus) {
    await NotificationService.createNotification({
      title: "Turf Status Updated",
      message: `The status of your turf "${result.name}" has been updated to ${rest.turfStatus}.`,
      userId: turfOwner.userId,
      type: NotificationType.SYSTEM
    });
  }

  // If status is changed to MAINTENANCE, notify all affected players
  if (rest.turfStatus === TurfStatus.MAINTENANCE) {
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        turfId: id,
        status: BookingStatus.CONFIRMED,
        date: { gte: new Date() }
      },
      include: { 
        player: true,
        turfSlot: { include: { slot: true } },
        customSlot: true
      }
    });

    for (const booking of upcomingBookings) {
      if (booking.player) {
        let timeInfo = { startTime: "N/A", endTime: "N/A" };
        if (booking.turfSlot) {
          timeInfo = { startTime: booking.turfSlot.slot.startTime, endTime: booking.turfSlot.slot.endTime };
        } else if (booking.customSlot) {
          timeInfo = { startTime: booking.customSlot.startTime, endTime: booking.customSlot.endTime };
        }

        await sendEmail({
          to: booking.player.email,
          subject: "Urgent: Turf Maintenance Alert",
          templateName: "maintenance-alert",
          templateData: {
            playerName: booking.player.name,
            turfName: result.name,
            date: booking.date.toDateString(),
            startTime: timeInfo.startTime,
            endTime: timeInfo.endTime
          }
        });
      }
    }
  }

  return result;
};

const deleteTurf = async (userId: string, id: string) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const turf = await prisma.turf.findUnique({
    where: { id },
  });

  if (!turf) {
    throw new AppError(status.NOT_FOUND, "Turf not found!");
  }

  if (turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this Turf!");
  }

  await prisma.turf.delete({
    where: { id },
  });

  return null;
};

const addImagesToTurf = async (id: string, newImageUrls: string[]) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: {
      userId: id,
    },
    include: {
      turf: true,
    },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  if (!turfOwner.turf) {
    throw new AppError(status.NOT_FOUND, "Turf not found!");
  }

  if (turfOwner.turf.ownerId !== turfOwner.id) {
    throw new AppError(status.FORBIDDEN, "You are not the owner of this Turf!");
  }

  const turf = await prisma.turf.findUniqueOrThrow({
    where: {
      id: turfOwner.turf.id,
    },
  });

  const updatedImages = [...turf.images, ...newImageUrls];

  const result = await prisma.turf.update({
    where: { id: turfOwner.turf.id },
    data: {
      images: {
        set: updatedImages,
      },
    },
  });

  return result;
};

const removeImageFromTurf = async (id: string, imageUrl: string) => {
  const turf = await prisma.turf.findUniqueOrThrow({
    where: { id },
  });

  const updatedImages = turf.images.filter((img) => img !== imageUrl);

  const result = await prisma.turf.update({
    where: { id },
    data: {
      images: {
        set: updatedImages,
      },
    },
  });

  return result;
};

const getMyTurf = async (userId: string) => {
  const turfOwner = await prisma.turfOwner.findUnique({
    where: { userId },
  });

  if (!turfOwner) {
    throw new AppError(status.NOT_FOUND, "Turf Owner profile not found!");
  }

  const result = await prisma.turf.findUnique({
    where: { ownerId: turfOwner.id },
    include: {
      owner: true,
      sportTypes: true,
      turfSlots: {
        include: {
          slot: true,
        },
      },
      reviews: true,
    },
  });

  return result;
};

export const TurfService = {
  createTurf,
  getMyTurf,
  getAllTurfs,
  getSingleTurf,
  updateTurf,
  deleteTurf,
  removeImageFromTurf,
  addImagesToTurf,
};
