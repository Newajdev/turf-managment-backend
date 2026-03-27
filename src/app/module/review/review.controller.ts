import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { status } from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getTurfReviews = catchAsync(async (req: Request, res: Response) => {
  const { turfId } = req.params;
  const result = await ReviewService.getTurfReviews(turfId as string, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Turf reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ReviewService.getMyReviews(userId, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await ReviewService.updateReview(userId, id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  await ReviewService.deleteReview(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getTurfReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
