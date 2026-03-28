import { Role, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterPlayer, ICreateTurfOwner, ILogin, IChangePassword, IForgotPassword, IResetPassword } from "./auth.interface";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";

const registerPlayer = async (payload: IRegisterPlayer) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(status.CONFLICT, "User with this email already exists!");
  }

  const data = await auth.api.signUpEmail({
    body: {
      email,
      password: password as string,
      name,
    },
  });
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to create user");
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
    throw new AppError(
      status.CONFLICT,
      "TurfOwner with this email already exists!",
    );
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
    throw new AppError(status.BAD_REQUEST, "Failed to create user");
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
    throw new AppError(status.FORBIDDEN, "This user is Deleted");
  } else if (data.user.userStatus === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "This user is Blocked");
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

const refreshToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found!");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const jwtPayload = {
    userId: verifiedRefreshToken.data.userId,
    email: verifiedRefreshToken.data.email,
    role: verifiedRefreshToken.data.role,
    name: verifiedRefreshToken.data.name,
    status: verifiedRefreshToken.data.status,
    isDeleted: verifiedRefreshToken.data.isDeleted,
    emailVerified: verifiedRefreshToken.data.emailVerified,
  };

  const newAccessToken = tokenUtils.getAccessToken(jwtPayload);
  const newRefreshToken = tokenUtils.getRefreshToken(jwtPayload);
  

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const logout = async (sessionToken?: string) => {
  if (sessionToken) {
    await prisma.session.deleteMany({
      where: {
        token: sessionToken,
      },
    });
  }
};

const changePassword = async (
  payload: IChangePassword,
  sessionToken: string,
) => {

  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  
  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.userStatus,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.userStatus,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: IForgotPassword) => {
  const { email } = payload;
  const result = await auth.api.sendVerificationOTP({
    body: {
      email,
      type: "forget-password",
    },
  });
  return result;
};

const resetPassword = async (payload: IResetPassword) => {
  const { otp, password } = payload;
  const result = await auth.api.resetPassword({
    body: {
      newPassword: password,
      token: otp,
    },
  });
  return result;
};

export const AuthService = {
  registerPlayer,
  createTurfOwner,
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
