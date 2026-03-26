import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MasterSlotService } from "./slots.service";
import status from "http-status";

const createMasterSlot = catchAsync(async (req: Request, res: Response) => {
  const result = await MasterSlotService.createMasterSlot(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Master slot created successfully",
    data: result,
  });
});

const getAllMasterSlots = catchAsync(async (req: Request, res: Response) => {
  const result = await MasterSlotService.getAllMasterSlots();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Master slots retrieved successfully",
    data: result,
  });
});

const getSingleMasterSlot = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MasterSlotService.getSingleMasterSlot(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Master slot retrieved successfully",
    data: result,
  });
});

const updateMasterSlot = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MasterSlotService.updateMasterSlot(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Master slot updated successfully",
    data: result,
  });
});

const deleteMasterSlot = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await MasterSlotService.deleteMasterSlot(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Master slot deleted successfully",
    data: null,
  });
});

export const MasterSlotController = {
  createMasterSlot,
  getAllMasterSlots,
  getSingleMasterSlot,
  updateMasterSlot,
  deleteMasterSlot,
};
