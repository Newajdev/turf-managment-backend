import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await UserService.getMyProfile(userId, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await UserService.updateMyProfile(userId, role, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const deleteMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  await UserService.deleteMyProfile(userId, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile deleted successfully",
    data: null,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.blockUser(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  blockUser,
  getAllUsers,
};
