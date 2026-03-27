import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReportService } from "./report.service";
import { status } from "http-status";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ReportService.createReport(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Report submitted successfully",
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getAllReports(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reports retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyReports = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await ReportService.getMyReports(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your reports retrieved successfully",
    data: result,
  });
});

const deleteReport = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const { id } = req.params;
  await ReportService.deleteReport(userId, id as string, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Report deleted successfully",
    data: null,
  });
});

export const ReportController = {
  createReport,
  getAllReports,
  getMyReports,
  deleteReport,
};
