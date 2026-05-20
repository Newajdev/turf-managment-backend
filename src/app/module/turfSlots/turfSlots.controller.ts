import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TurfSlotsService } from "./turfSlots.service";
import { status } from "http-status";

const createTurfSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await TurfSlotsService.createTurfSlot(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Turf slot created successfully",
    data: result,
  });
});

const createCustomTurfSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await TurfSlotsService.createCustomTurfSlot(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Custom turf slot created successfully",
    data: result,
  });
});

const getRegularSlotsByTurf = catchAsync(async (req: Request, res: Response) => {
  const { turfId } = req.params;
  const result = await TurfSlotsService.getRegularSlotsByTurf(turfId as string, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Regular slots retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCustomSlotsByPlayer = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { turfId } = req.params;
  const result = await TurfSlotsService.getCustomSlotsByPlayer(userId, turfId as string, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Custom slots retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const deleteTurfSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  await TurfSlotsService.deleteTurfSlot(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Slot deleted successfully",
    data: null,
  });
});

const bulkCreateTurfSlots = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await TurfSlotsService.bulkCreateTurfSlots(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Turf slots created successfully",
    data: result,
  });
});

const updateCustomTurfSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await TurfSlotsService.updateCustomTurfSlot(userId, id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Custom turf slot updated successfully",
    data: result,
  });
});

const deleteCustomTurfSlot = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await TurfSlotsService.deleteCustomTurfSlot(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Custom turf slot deleted successfully",
    data: result,
  });
});

const getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
  const { turfId } = req.params;
  const { date } = req.query;
  const result = await TurfSlotsService.getAvailableSlots(turfId as string, date as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Available slots retrieved successfully",
    data: result,
  });
});

export const TurfSlotsController = {
  createTurfSlot,
  createCustomTurfSlot,
  getRegularSlotsByTurf,
  getAvailableSlots,
  getCustomSlotsByPlayer,
  deleteTurfSlot,
  bulkCreateTurfSlots,
  updateCustomTurfSlot,
  deleteCustomTurfSlot,
};
