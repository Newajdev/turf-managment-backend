import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";

const registerPlayer = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerPlayer(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Player registered successfully",
    data: result,
  });
});

const createTurfOwner = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.createTurfOwner(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Turf Owner created successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

export const AuthController = {
  registerPlayer,
  createTurfOwner,
  login,
};
