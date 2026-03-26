import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { ITurf } from "./turf.interface";
import { TurfStatus } from "../../../generated/prisma/enums";

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
    throw new AppError(status.CONFLICT, "One Turf Owner can only create one Turf!");
  }

  const { sportsTypes, turfSlots, ...turfData } = payload;


 const sportsTypesData = sportsTypes?.map((id) => ({ id }));
 const turfSlotsData = turfSlots?.map((slot) => ({
   slotId: slot.slotId,
   price: slot.price,
 }));

 const result = await prisma.turf.create({
   data: {
     ...turfData,
     ownerId: turfOwner.id,
     sportTypes: sportsTypesData && { connect: sportsTypesData },
     turfSlots: turfSlotsData && { create: turfSlotsData },
   },
   include: {
     sportTypes: true,
     turfSlots: true,
     owner:true
   }
 });


  return result;
};

const getAllTurfs = async () => {
  const result = await prisma.turf.findMany({
    include: {
      owner: true,
      sportTypes: true,
    },
  });
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
            slot: true
        }
      },
      reviews: true,
    },
  });
  return result;
};


const updateTurf = async (userId: string, id: string, payload: Partial<ITurf>) => {
  const { maintenanceDetails, sportsTypes, turfSlots, ...rest } = payload;

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

  const result = await prisma.turf.update({
    where: { id },
    data: {
      ...rest,
      sportTypes: sportsTypes
        ? {
            set: sportsTypes.map((id) => ({ id })),
          }
        : undefined,
      turfSlots: turfSlots
        ? {
            deleteMany: {},
            create: turfSlots.map((slot) => ({
              slotId: slot.slotId,
              price: Number(slot.price),
            })),
          }
        : undefined,
    },
  });

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
      userId: id
    },
    include: {
      turf: true
    }
  })

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
      id: turfOwner.turf.id
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



export const TurfService = {
  createTurf,
  getAllTurfs,
  getSingleTurf,
  updateTurf,
  deleteTurf,
  removeImageFromTurf,
  addImagesToTurf,
};
