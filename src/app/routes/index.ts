import { Router } from "express";
import { SportTypeRoutes } from "../module/sportType/sportType.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { SlotRoutes } from "../module/slots/slots.route";
import { TurfRoutes } from "../module/turf/turf.route";
import { TurfSlotsRoutes } from "../module/turfSlots/turfSlots.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/slots", SlotRoutes);
router.use("/turf", TurfRoutes);
router.use("/turf-slots", TurfSlotsRoutes);
router.use("/sport-type", SportTypeRoutes);

export const IndexRoutes = router;
