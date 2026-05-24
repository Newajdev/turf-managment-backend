import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";
import { sendEmail, EmailTemplate } from "../../utils/email";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";
import ejs from "ejs";
import path from "path";
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
    data: result,
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

  sendEmail({
    to: result.user.email,
    subject: "Password Changed Successfully",
    templateName: EmailTemplate.PasswordChanged,
    templateData: {
      name: result.user.name,
    },
  });

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

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyEmail(req.body);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
    data: result,
  });
});

const resendVerificationOTP = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.resendVerificationOTP(req.body);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Verification OTP resent successfully",
      data: result,
    });
  },
);

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;

  const result = await AuthService.resetPassword(email, otp, password);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});


const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const betterAuthUrl = envVars.BETTER_AUTH_URL;
  const callbackURL = `${betterAuthUrl}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  const templatePath = path.resolve(__dirname, "../../templates/google-login.ejs");
  const html = await ejs.renderFile(templatePath, { callbackURL });
  res.send(html);
});


const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";

  const sessionToken = req.cookies["better-auth.session_token"];

  if (!sessionToken) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/auth/login?error=oauth_failed`,
    );
  }

  const session = await auth.api.getSession({
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  if (!session) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/auth/login?error=no_session_found`,
    );
  }

  if (session && !session.user) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/auth/login?error=no_user_found`,
    );
  }

  const result = await AuthService.googleLoginSuccess(session);

  const { accessToken, refreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});

const handleOAuthError = catchAsync((req: Request, res: Response) => {
  const error = (req.query.error as string) || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/auth/login?error=${error}`);
});

export const AuthController = {
  registerPlayer,
  createTurfOwner,
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  verifyEmail,
  resendVerificationOTP,
  resetPassword,
  googleLoginSuccess,
  googleLogin,
  handleOAuthError,
};
