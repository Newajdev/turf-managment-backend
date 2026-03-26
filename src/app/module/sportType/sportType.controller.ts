import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { SportTypeService } from './sportType.service';
import status from 'http-status';

const createSportType = catchAsync(async (req: Request, res: Response) => {
    const result = await SportTypeService.createSportType(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: 'SportType created successfully',
        data: result,
    });
});

const getAllSportTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await SportTypeService.getAllSportTypes();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'SportTypes retrieved successfully',
        data: result,
    });
});

const getSingleSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SportTypeService.getSingleSportType(id as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "SportType retrieved successfully",
      data: result,
    });
});

const updateSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SportTypeService.updateSportType(id as string, req.body);

    sendResponse(res, {
        httpStatusCode: status.UPGRADE_REQUIRED,
        success: true,
        message: 'SportType updated successfully',
        data: result,
    });
});

const deleteSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await SportTypeService.deleteSportType(id as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "SportType deleted successfully",
      data: null,
    });
});

export const SportTypeController = {
    createSportType,
    getAllSportTypes,
    getSingleSportType,
    updateSportType,
    deleteSportType,
};
