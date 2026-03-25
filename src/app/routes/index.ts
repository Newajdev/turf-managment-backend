import { Router } from "express";
import { SportTypeRoutes } from "../module/sportType/sportType.route";


const router = Router();

router.use("/sport-type", SportTypeRoutes);

export const IndexRoutes = router;
