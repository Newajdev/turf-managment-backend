import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IUserUpdate } from "./user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../../../generated/prisma/enums";

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


    await tx.session.deleteMany({ where: { userId } });

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

  if (data.status === UserStatus.BLOCKED) {
    await NotificationService.createNotification({
      title: "Account Blocked",
      message: "Your account has been blocked by the System Administrator.",
      userId: userId,
      type: NotificationType.SYSTEM
    });
  } else if (data.status === UserStatus.DELETED) {
    await NotificationService.createNotification({
      title: "Account Deleted",
      message: "Your account has been deleted.",
      userId: userId,
      type: NotificationType.SYSTEM
    });
  }

  return result;
};

const getAllUsers = async (query: IQueryParams) => {
  const userQuery = new QueryBuilder(prisma.user, query, {
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

const updateProfilePhoto = async (userId: string, role: Role, photoUrl: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found!");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update User table
    await tx.user.update({
      where: { id: userId },
      data: { image: photoUrl },
    });

    // 2. Update Role-specific table
    if (role === Role.PLAYER) {
      await tx.player.update({
        where: { userId },
        data: { profilePhoto: photoUrl },
      });
    } else if (role === Role.TURF_OWNER) {
      await tx.turfOwner.update({
        where: { userId },
        data: { profilePhoto: photoUrl },
      });
    } else if (role === Role.SYSTEM_ADMIN) {
      await tx.systemAdmin.update({
        where: { userId },
        data: { profilePhoto: photoUrl },
      });
    }

    return photoUrl;
  });

  return result;
};

const getFavoriteTurfs = async (userId: string) => {
  const player = await prisma.player.findUnique({
    where: { userId, isDeleted: false },
    include: {
      favoriteTurfs: {
        include: { sportTypes: true },
      },
    },
  });

  if (!player) {
    throw new AppError(status.FORBIDDEN, "Only players can access favorites!");
  }

  return player.favoriteTurfs;
};

const toggleFavoriteTurf = async (userId: string, turfId: string) => {
  const player = await prisma.player.findUnique({
    where: { userId, isDeleted: false },
    include: {
      favoriteTurfs: { where: { id: turfId }, select: { id: true } },
    },
  });

  if (!player) {
    throw new AppError(status.FORBIDDEN, "Only players can save turfs!");
  }

  const turf = await prisma.turf.findUnique({ where: { id: turfId } });
  if (!turf) {
    throw new AppError(status.NOT_FOUND, "Turf not found!");
  }

  const isFavorite = player.favoriteTurfs.length > 0;

  await prisma.$transaction(async (tx) => {
    if (isFavorite) {
      await tx.player.update({
        where: { id: player.id },
        data: { favoriteTurfs: { disconnect: { id: turfId } } },
      });
      await tx.turf.update({
        where: { id: turfId },
        data: { saveCount: { decrement: 1 } },
      });
    } else {
      await tx.player.update({
        where: { id: player.id },
        data: { favoriteTurfs: { connect: { id: turfId } } },
      });
      await tx.turf.update({
        where: { id: turfId },
        data: { saveCount: { increment: 1 } },
      });
    }
  });

  return { isFavorite: !isFavorite, turfId };
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  blockUser,
  getAllUsers,
  updateProfilePhoto,
  getFavoriteTurfs,
  toggleFavoriteTurf,
};
