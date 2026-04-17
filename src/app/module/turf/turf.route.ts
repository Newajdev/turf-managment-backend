import express from "express";
import { TurfController } from "./turf.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { TurfValidations } from "./turf.validation";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
  "/upload-images",
  checkAuth(Role.TURF_OWNER),
  multerUpload.array("images", 5),
  TurfController.uploadImages,
);

router.delete(
  "/delete-image",
  checkAuth(Role.TURF_OWNER),
  TurfController.deleteImage,
);

router.post(
  "/",
  checkAuth(Role.TURF_OWNER),
  validateRequest(TurfValidations.createTurfSchema),
  TurfController.createTurf,
);

router.get(
  "/",
  // checkAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  TurfController.getAllTurfs,
);

router.get(
  "/my-turf",
  checkAuth(Role.TURF_OWNER),
  TurfController.getMyTurf,
);

router.get(
  "/:id",
  // heckAuth(Role.PLAYER, Role.TURF_OWNER, Role.SYSTEM_ADMIN),
  TurfController.getSingleTurf,
);

router.patch(
  "/:id",
  checkAuth(Role.TURF_OWNER),
  validateRequest(TurfValidations.updateTurfSchema),
  TurfController.updateTurf,
);

router.delete(
  "/:id",
  checkAuth(Role.TURF_OWNER),
  TurfController.deleteTurf,
);

export const TurfRoutes = router;
