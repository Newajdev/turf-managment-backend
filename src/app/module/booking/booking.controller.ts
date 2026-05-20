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

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.getBookingById(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
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

const rejectBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.rejectBooking(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking rejected successfully",
    data: result,
  });
});

const acceptBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.acceptBooking(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking accepted successfully",
    data: result,
  });
});

const createBookingForCustomSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await BookingService.createBookingForCustomSlot(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Requested custom booking successfully",
    data: result,
  });
});

const makePaymentForCustomSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.makePaymentForCustomSlot(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const completeBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await BookingService.completeBooking(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking marked as completed",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  getTurfBookings,
  createBookingForCustomSlot,
  makePaymentForCustomSlot,
  cancelBooking,
  rejectBooking,
  acceptBooking,
  completeBooking,
  getAllBookings,
};
