/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TurfService } from "./turf.service";
import { status } from "http-status";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";

const uploadImages = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const files = req.files as any[];


  if (!userId) {
    throw new AppError(status.BAD_REQUEST, "Turf ID is required");
  }

  if (!files || files.length === 0) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "No images provided",
      data: null,
    });
  }

  const imageUrls = files.map((file) => file.path);


  const result = await TurfService.addImagesToTurf(userId, imageUrls);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Images uploaded and saved successfully",
    data: result,
  });
});

const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { id, imageUrl } = req.body;

  if (!id || !imageUrl) {
    throw new AppError(
      status.BAD_REQUEST,
      "Turf ID and Image URL are required",
    );
  }

  await deleteFileFromCloudinary(imageUrl);

  const result = await TurfService.removeImageFromTurf(id, imageUrl);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Image deleted successfully",
    data: result,
  });
});


const createTurf = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await TurfService.createTurf(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Turf created successfully",
    data: result,
  });
});

const getAllTurfs = catchAsync(async (req: Request, res: Response) => {
  const result = await TurfService.getAllTurfs(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turfs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleTurf = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TurfService.getSingleTurf(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turf retrieved successfully",
    data: result,
  });
});

const updateTurf = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await TurfService.updateTurf(userId, id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turf updated successfully",
    data: result,
  });
});

const deleteTurf = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  await TurfService.deleteTurf(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turf deleted successfully",
    data: null,
  });
});

export const TurfController = {
  uploadImages,
  deleteImage,
  createTurf,
  getAllTurfs,
  getSingleTurf,
  updateTurf,
  deleteTurf,
};
