import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { BookingController } from "./booking.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { BookingValidations } from "./booking.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PLAYER),
  validateRequest(BookingValidations.createBookingSchema),
  BookingController.createBooking,
);

router.get(
  "/my-bookings",
  checkAuth(Role.PLAYER),
  BookingController.getMyBookings,
);

router.get(
  "/turf/:turfId",
  checkAuth(Role.TURF_OWNER),
  BookingController.getTurfBookings,
);

router.patch(
  "/cancel/:id",
  checkAuth(Role.PLAYER, Role.TURF_OWNER),
  BookingController.cancelBooking,
);

router.patch(
  "/reject/:id",
  checkAuth(Role.TURF_OWNER),
  BookingController.rejectBooking,
);

router.patch(
  "/accept/:id",
  checkAuth(Role.TURF_OWNER),
  BookingController.acceptBooking,
);

export const BookingRoutes = router;
