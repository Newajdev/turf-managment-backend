import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

router.get(
  "/admin",
  checkAuth(Role.SYSTEM_ADMIN),
  AnalyticsController.getAdminAnalytics,
);
router.get(
  "/public-state",
  AnalyticsController.getState,
);

router.get(
  "/owner",
  checkAuth(Role.TURF_OWNER),
  AnalyticsController.getOwnerAnalytics,
);

router.get(
  "/player",
  checkAuth(Role.PLAYER),
  AnalyticsController.getPlayerAnalytics,
);

export const AnalyticsRoutes = router;
