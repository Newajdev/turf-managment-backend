import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
  "/",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  NotificationController.getMyNotifications,
);

router.patch(
  "/mark-read/:id",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  NotificationController.markAsRead,
);

router.patch(
  "/mark-all-read",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  NotificationController.markAllAsRead,
);

router.delete(
  "/:id",
  checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
