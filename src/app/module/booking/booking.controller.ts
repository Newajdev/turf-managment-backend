import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BookingService } from "./booking.service";
import { status } from "http-status";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await BookingService.getMyBookings(userId, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getTurfBookings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { turfId } = req.params;
  const result = await BookingService.getTurfBookings(userId, turfId as string, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turf bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.cancelBooking(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getTurfBookings,
  cancelBooking,
};
