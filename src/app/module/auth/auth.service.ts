import { Role, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterPlayer, ICreateTurfOwner, ILogin } from "./auth.interface";

const registerPlayer = async (payload: IRegisterPlayer) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password: password as string,
      name,
    },
  });
  if (!data.user) {
    throw new Error("Filed to create user")
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
    throw new Error("Filed to create user");
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
    throw new Error("This user is Deleted");
  } else if (data.user.userStatus === UserStatus.BLOCKED) {
    throw new Error("This user is Blocked");
  }

  return data;
};

export const AuthService = {
  registerPlayer,
  createTurfOwner,
  login,
};
