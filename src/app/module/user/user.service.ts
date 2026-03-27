import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IUserUpdate } from "./user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const getMyProfile = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    include: {
      player: role === Role.PLAYER,
      turfOwner: role === Role.TURF_OWNER,
      systemAdmin: role === Role.SYSTEM_ADMIN,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  return user;
};

const updateMyProfile = async (userId: string, role: Role, payload: IUserUpdate) => {
  const { name, profilePhoto, contactNumber } = payload;

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  const result = await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: { id: userId },
      data: {
        name,
        image: profilePhoto,
      },
    });
   


    if (role === Role.PLAYER) {
      await tx.player.update({
        where: { userId },
        data: {
          name: name ,
          profilePhoto: profilePhoto ,
          contactNumber: contactNumber ,
        },
      });
    } else if (role === Role.TURF_OWNER) {
      await tx.turfOwner.update({
        where: { userId },
        data: {
          name: name,
          profilePhoto: profilePhoto,
          contactNumber: contactNumber,
        },
      });
    } else if (role === Role.SYSTEM_ADMIN) {
      await tx.systemAdmin.update({
        where: { userId },
        data: {
          name: name,
          profilePhoto: profilePhoto,
          contactNumber: contactNumber,
        },
      });
    }

    return await tx.user.findUnique({
      where: { id: userId },
      include: {
        player: role === Role.PLAYER,
        turfOwner: role === Role.TURF_OWNER,
        systemAdmin: role === Role.SYSTEM_ADMIN,
      },
    });
  });

  return result;
};

const deleteMyProfile = async (userId: string, role: Role) => {
  if (role === Role.SYSTEM_ADMIN) {
    throw new AppError(status.FORBIDDEN, "System Admin cannot delete your own profile!");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        userStatus: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });


    if (role === Role.PLAYER) {
      await tx.player.update({
        where: { userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } else if (role === Role.TURF_OWNER) {
      await tx.turfOwner.update({
        where: { userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }
  });

  return null;
};

const blockUser = async (userId: string, data: { status: UserStatus }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  if (user.role === Role.SYSTEM_ADMIN) {
    throw new AppError(status.FORBIDDEN, "System Admin cannot be blocked!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      userStatus: data.status,
    },
  });

  return result;
};

const getAllUsers = async (query: IQueryParams) => {
  const userQuery = new QueryBuilder(prisma.user as any, query, {
      searchableFields: ["name", "email"],
      filterableFields: ["role", "userStatus"],
  })
  .search()
  .filter()
  .sort()
  .paginate();

  const result = await userQuery.execute();
  return result;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  blockUser,
  getAllUsers,
};
