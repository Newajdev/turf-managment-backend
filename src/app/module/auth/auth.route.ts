import express from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidations } from "./auth.validation";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/register-player",
  validateRequest(AuthValidations.registerPlayerSchema),
  AuthController.registerPlayer,
);
router.post(
  "/create-turf-owner",
  checkAuth(Role.SYSTEM_ADMIN),
  validateRequest(AuthValidations.createTurfOwnerSchema),
  AuthController.createTurfOwner,
);

router.post(
  "/login",
  validateRequest(AuthValidations.loginSchema),
  AuthController.login,
);
router.post("/refresh-token", checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN), AuthController.refreshToken);
router.post("/logout", checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN), AuthController.logout);
router.post("/change-password", checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN), AuthController.changePassword);

router.post(
  "/forgot-password",
  validateRequest(AuthValidations.forgetPasswordSchema),
  AuthController.forgotPassword,
);

router.post(
  "/verify-email",
  validateRequest(AuthValidations.verifyEmailSchema),
  AuthController.verifyEmail,
);

router.post(
  "/resend-verification-otp",
  validateRequest(AuthValidations.resendOTPVerificationSchema),
  AuthController.resendVerificationOTP,
);

router.post(
  "/reset-password",
  validateRequest(AuthValidations.resetPasswordSchema),
  AuthController.resetPassword,
);

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/google/error", AuthController.handleOAuthError);




export const AuthRoutes = router;
