import { Role, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterPlayer, ICreateTurfOwner, ILogin } from "./auth.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPlayer = async (payload: IRegisterPlayer) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "User with this email already exists!");
  }

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password: password as string,
      name,
    },
  });
  if (!data.user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create user");
  }

  
  try {
    const player = await prisma.$transaction(async (tx) => {
      const playerTx = await tx.player.create({
        data: {
          userId: data.user.id,
          name,
          email,
        },
      });

      return playerTx
    });

    return {
      user: data.user,
      token: data.token,
      player,
    };

  } catch (error) {
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });

    throw error;
  }

  
};

const createTurfOwner = async (payload: ICreateTurfOwner) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "TurfOwner with this email already exists!");
  }

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password: password as string,
      name,
      role: Role.TURF_OWNER,
      needPasswordChange: true,
    },
  });

  if (!data.user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create user");
  }


  try {
    const turfOwner = await prisma.$transaction(async (tx) => {
      const turfOnwerTx =  await tx.turfOwner.create({
        data: {
          userId: data.user.id,
          name,
          email,
        },
      });

      return turfOnwerTx;
    });

    return {
      user: data.user,
      turfOwner,
    };

  } catch (error) {
    
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });

    throw error;
  }

  
};

const login = async (payload: ILogin) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password: password as string,
    },
  });

  if (data.user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is Deleted");
  } else if (data.user.userStatus === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is Blocked");
  }

  const jwtPayload = {
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    status: data.user.userStatus,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

  return {
    user: data.user,
    betterAuthToken: data.token,
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerPlayer,
  createTurfOwner,
  login,
};
