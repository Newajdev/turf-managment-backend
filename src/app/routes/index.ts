import { Router } from "express";
import { AnalyticsRoutes } from "../module/analytics/analytics.route";
import { NotificationRoutes } from "../module/notification/notification.route";
import { ReportRoutes } from "../module/report/report.route";
import { ReviewRoutes } from "../module/review/review.route";
import { SportTypeRoutes } from "../module/sportType/sportType.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { DebugRoutes } from "./debug";
import { BookingRoutes } from "../module/booking/booking.route";
import { UserRoutes } from "../module/user/user.route";
import { SlotRoutes } from "../module/slots/slots.route";
import { TurfRoutes } from "../module/turf/turf.route";
import { TurfSlotsRoutes } from "../module/turfSlots/turfSlots.route";


const router = Router();

router.use("/analytics", AnalyticsRoutes);
router.use("/auth", AuthRoutes);
router.use("/booking", BookingRoutes);
router.use("/user", UserRoutes);
router.use("/slots", SlotRoutes);
router.use("/turf", TurfRoutes);
router.use("/turf-slots", TurfSlotsRoutes);
router.use("/notification", NotificationRoutes);
router.use("/report", ReportRoutes);
router.use("/review", ReviewRoutes);
router.use("/sport-type", SportTypeRoutes);
router.use("/debug", DebugRoutes);

export const IndexRoutes = router;
