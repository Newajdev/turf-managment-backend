import express from "express";
import { MasterSlotController } from "./slots.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { MasterSlotValidations } from "./slots.validation";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.SYSTEM_ADMIN),
  validateRequest(MasterSlotValidations.createMasterSlotSchema),
  MasterSlotController.createMasterSlot,
);

router.get(
  "/",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  MasterSlotController.getAllMasterSlots,
);

router.get(
  "/:id",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  MasterSlotController.getSingleMasterSlot,
);

router.patch(
  "/:id",
  checkAuth(Role.SYSTEM_ADMIN),
  validateRequest(MasterSlotValidations.updateMasterSlotSchema),
  MasterSlotController.updateMasterSlot,
);

router.delete(
  "/:id",
  checkAuth(Role.SYSTEM_ADMIN),
  MasterSlotController.deleteMasterSlot,
);

export const SlotRoutes = router;
