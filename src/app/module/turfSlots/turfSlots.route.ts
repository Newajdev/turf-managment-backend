import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { TurfSlotsController } from "./turfSlots.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { TurfSlotValidations } from "./turfSlots.validation";

const router = Router();

// Regular Slot Management (Owner)
router.post(
  "/",
  checkAuth(Role.TURF_OWNER),
  validateRequest(TurfSlotValidations.createTurfSlotSchema),
  TurfSlotsController.createTurfSlot,
);

// Custom Slot Management (Player)
router.post(
  "/custom",
  checkAuth(Role.PLAYER),
  validateRequest(TurfSlotValidations.createCustomTurfSlotSchema),
  TurfSlotsController.createCustomTurfSlot,
);

// Retrieval
router.get("/:turfId", TurfSlotsController.getRegularSlotsByTurf); // Public

router.get("/custom/:turfId", checkAuth(Role.PLAYER), TurfSlotsController.getCustomSlotsByPlayer); // Protected

// Deletion
router.delete("/:id", checkAuth(Role.TURF_OWNER), TurfSlotsController.deleteTurfSlot);

export const TurfSlotsRoutes = router;
