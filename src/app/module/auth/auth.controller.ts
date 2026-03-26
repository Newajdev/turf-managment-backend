import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";

const registerPlayer = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerPlayer(req.body);
  const { accessToken, refreshToken, betterAuthToken, user, player } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  if (betterAuthToken) {
    tokenUtils.setBetterAuthSessionCookie(res, betterAuthToken);
  }

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Player registered successfully",
    data: {
      user,
      player,
      betterAuthToken,
      accessToken,
      refreshToken,
    },
  });
});

const createTurfOwner = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.createTurfOwner(req.body);
  

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Turf Owner created successfully",
    data: result
    ,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  const { accessToken, refreshToken, betterAuthToken, user } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, betterAuthToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged in successfully",
    data: {
      user,
      betterAuthToken,
      accessToken,
      refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies["refreshToken"];
  const sessionToken = req.cookies["better-auth.session_token"];

  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found!");
  }

  if (!sessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session token not found!");
  }

  const result = await AuthService.refreshToken(refreshToken, sessionToken);

  tokenUtils.setAccessTokenCookie(res, result.accessToken);
  tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, result.sessionToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Access token retrieved successfully",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionToken: result.sessionToken,
    },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  await AuthService.logout(sessionToken);

  const cookieOptions = { path: "/", secure: true, sameSite: "none" as const };
  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});


const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  if (!betterAuthSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "No session token found");
  }

  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});




export const AuthController = {
  registerPlayer,
  createTurfOwner,
  login,
  refreshToken,
  logout,
  changePassword,
};
