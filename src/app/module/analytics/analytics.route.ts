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
  "/owner",
  checkAuth(Role.TURF_OWNER),
  AnalyticsController.getOwnerAnalytics,
);

export const AnalyticsRoutes = router;
