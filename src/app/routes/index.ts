import { Router } from "express";
import { SportTypeRoutes } from "../module/sportType/sportType.route";
import { AuthRoutes } from "../module/auth/auth.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/sport-type", SportTypeRoutes);

export const IndexRoutes = router;
