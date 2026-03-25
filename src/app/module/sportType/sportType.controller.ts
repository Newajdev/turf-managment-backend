import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { SportTypeService } from './sportType.service';
import { SportTypeValidations } from './sportType.validation';

const createSportType = catchAsync(async (req: Request, res: Response) => {
    const validatedData = SportTypeValidations.sportTypeValidationSchema.parse({
        body: req.body,
    });

    const result = await SportTypeService.createSportType(validatedData.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: 'SportType created successfully',
        data: result,
    });
});

const getAllSportTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await SportTypeService.getAllSportTypes();

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: 'SportTypes retrieved successfully',
        data: result,
    });
});

const getSingleSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SportTypeService.getSingleSportType(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: 'SportType retrieved successfully',
        data: result,
    });
});

const updateSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = SportTypeValidations.updateSportTypeValidationSchema.parse({
        body: req.body,
    });

    const result = await SportTypeService.updateSportType(id as string, validatedData.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: 'SportType updated successfully',
        data: result,
    });
});

const deleteSportType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SportTypeService.deleteSportType(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: 'SportType deleted successfully',
        data: result,
    });
});

export const SportTypeController = {
    createSportType,
    getAllSportTypes,
    getSingleSportType,
    updateSportType,
    deleteSportType,
};
