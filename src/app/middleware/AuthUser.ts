/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user: any = null;

      const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
      let accessToken = CookieUtils.getCookie(req, "accessToken");

      // Fallback to Authorization header if cookie is missing
      const authHeader = req.headers.authorization;
      if (!accessToken && authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }

      // 1. Try to verify via Session Token
      if (sessionToken && sessionToken !== "undefined") {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        if (sessionExists && sessionExists.user) {
          user = sessionExists.user;
        }
      }

      // 2. Try to verify via JWT if Session failed
      if (!user && accessToken && accessToken !== "undefined") {
        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          envVars.ACCESS_TOKEN_SECRET,
        );

        if (verifiedToken.success && verifiedToken.data) {
          // Fetch user from DB to ensure they still exist and status is active
          user = await prisma.user.findUnique({
            where: { id: verifiedToken.data.userId },
          });
        }
      }

      // 3. Final validation
      if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Please log in.");
      }

      if (user.userStatus === UserStatus.BLOCKED || user.isDeleted) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
      }

      // Role Check
      if (authRoles.length > 0 && !authRoles.includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission.");
      }

      // Password Change enforcement
      if (user.needPasswordChange && req.originalUrl !== "/api/v1/auth/change-password") {
        throw new AppError(status.FORBIDDEN, "Please change your password first.");
      }

      // Populate req.user
      (req.user as any) = {
        userId: user.id,
        role: user.role,
        email: user.email,
        needPasswordChange: user.needPasswordChange
      };

      next();
    } catch (error: any) {
      next(error);
    }
  };
