import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NotificationService } from "./notification.service";
import { status } from "http-status";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await NotificationService.getMyNotifications(userId, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await NotificationService.markAsRead(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  await NotificationService.deleteNotification(userId, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notification deleted successfully",
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
