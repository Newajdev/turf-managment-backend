import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";
import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";

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
    templateName: "password-changed",
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


const googleLogin = catchAsync((req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);

  // URLs for the script
  const betterAuthUrl = envVars.BETTER_AUTH_URL;
  const callbackURL = `${betterAuthUrl}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to Google...</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
        .container { text-align: center; }
        .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <p>Connecting to Google...</p>
    </div>

    <script>
        (async () => {
            try {
                const response = await fetch("${betterAuthUrl}/api/auth/sign-in/social", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        provider: "google",
                        callbackURL: "${callbackURL}"
                    })
                });

                const data = await response.json();

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error("No redirect URL returned from auth server");
                }
            } catch (error) {
                console.error("Redirect Error:", error);
                document.body.innerHTML = \`
                    <div style="text-align: center; color: #ef4444; padding: 20px;">
                        <h3>Login Failed</h3>
                        <p>Error: \${error.message}</p>
                        <button onclick="window.location.reload()" style="padding: 8px 16px; cursor: pointer;">Try Again</button>
                    </div>\`;
            }
        })();
    </script>
</body>
</html>
  `);
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
