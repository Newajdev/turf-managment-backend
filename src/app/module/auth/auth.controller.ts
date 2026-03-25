import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { AuthService } from './auth.service';
import { AuthValidations } from './auth.validation';

const registerPlayer = catchAsync(async (req: Request, res: Response) => {
    const validatedData = AuthValidations.registerPlayerSchema.parse({
        body: req.body,
    });

    const result = await AuthService.registerPlayer(validatedData.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: 'Player registered successfully',
        data: result,
    });
});

const createTurfOwner = catchAsync(async (req: Request, res: Response) => {
    const validatedData = AuthValidations.createTurfOwnerSchema.parse({
        body: req.body,
    });

    const result = await AuthService.createTurfOwner(validatedData.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: 'Turf Owner created successfully',
        data: result,
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const validatedData = AuthValidations.loginSchema.parse({
        body: req.body,
    });

    const result = await AuthService.login(validatedData.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: 'Logged in successfully',
        data: result,
    });
});

export const AuthController = {
    registerPlayer,
    createTurfOwner,
    login,
};
