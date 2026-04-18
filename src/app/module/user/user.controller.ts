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

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const file = req.file;

  if (!file) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "No image provided",
      data: null,
    });
  }

  const profilePhoto = file.path;

  // Delegate database update to Service layer
  await UserService.updateProfilePhoto(userId, role, profilePhoto);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile photo updated successfully",
    data: profilePhoto,
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
  uploadImage,
};
