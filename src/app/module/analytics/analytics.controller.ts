import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";
import { status } from "http-status";

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAdminAnalytics();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin analytics retrieved successfully",
    data: result,
  });
});
const getState = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getState();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin analytics retrieved successfully",
    data: result,
  });
});

const getOwnerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await AnalyticsService.getOwnerAnalytics(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Owner analytics retrieved successfully",
    data: result,
  });
});

const getPlayerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await AnalyticsService.getPlayerAnalytics(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Player analytics retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getAdminAnalytics,
  getState,
  getOwnerAnalytics,
  getPlayerAnalytics,
};
