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
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

router.post(
  "/forgot-password",
  validateRequest(AuthValidations.forgetPasswordSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(AuthValidations.resetPasswordSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
