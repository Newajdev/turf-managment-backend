import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { ReviewController } from "./review.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewValidations } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PLAYER),
  validateRequest(ReviewValidations.createReviewSchema),
  ReviewController.createReview,
);

router.get("/turf/:turfId", ReviewController.getTurfReviews); // Public

router.get("/my-reviews", checkAuth(Role.PLAYER), ReviewController.getMyReviews);

router.patch(
  "/:id",
  checkAuth(Role.PLAYER),
  validateRequest(ReviewValidations.updateReviewSchema),
  ReviewController.updateReview,
);

router.delete("/:id", checkAuth(Role.PLAYER), ReviewController.deleteReview);

export const ReviewRoutes = router;
