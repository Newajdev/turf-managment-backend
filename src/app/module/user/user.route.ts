import express from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidations } from "./user.validation";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/me",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  UserController.getMyProfile,
);

router.get(
  "/",
  checkAuth(Role.SYSTEM_ADMIN),
  UserController.getAllUsers,
);

router.patch(
  "/update-profile",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  validateRequest(UserValidations.updateUserSchema),
  UserController.updateMyProfile,
);

router.delete(
  "/delete-profile",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  UserController.deleteMyProfile,
);

router.patch(
  "/block-user/:id",
  checkAuth(Role.SYSTEM_ADMIN),
  validateRequest(UserValidations.blockUserSchema),
  UserController.blockUser,
);

export const UserRoutes = router;
