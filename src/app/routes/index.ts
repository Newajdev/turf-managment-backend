import { Router } from "express";
import { SportTypeRoutes } from "../module/sportType/sportType.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";



const router = Router();

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/sport-type", SportTypeRoutes);

export const IndexRoutes = router;
