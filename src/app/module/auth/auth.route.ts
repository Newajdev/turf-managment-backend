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
  "/change-password",
  checkAuth(Role.PLAYER, Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  validateRequest(AuthValidations.changePasswordSchema),
  AuthController.changePassword,
)

export const AuthRoutes = router;
