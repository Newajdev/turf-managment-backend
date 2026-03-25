/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { SportTypeService } from './sportType.service';
import { SportTypeValidations } from './sportType.validation';

const createSportType = async (req: Request, res: Response) => {
    try {
        const validatedData = SportTypeValidations.sportTypeValidationSchema.parse({
            body: req.body,
        });

        const result = await SportTypeService.createSportType(validatedData.body);

        res.status(201).json({
            success: true,
            message: 'SportType created successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create SportType',
            error,
        });
    }
};

const getAllSportTypes = async (req: Request, res: Response) => {
    try {
        const result = await SportTypeService.getAllSportTypes();
        res.status(200).json({
            success: true,
            message: 'SportTypes retrieved successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve SportTypes',
            error,
        });
    }
};

const getSingleSportType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await SportTypeService.getSingleSportType(id as string);
        res.status(200).json({
            success: true,
            message: 'SportType retrieved successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve SportType',
            error,
        });
    }
};

const updateSportType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = SportTypeValidations.updateSportTypeValidationSchema.parse({
            body: req.body,
        });
        const result = await SportTypeService.updateSportType(id as string, validatedData.body);
        res.status(200).json({
            success: true,
            message: 'SportType updated successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update SportType',
            error,
        });
    }
};

const deleteSportType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await SportTypeService.deleteSportType(id as string);
        res.status(200).json({
            success: true,
            message: 'SportType deleted successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete SportType',
            error,
        });
    }
};

export const SportTypeController = {
    createSportType,
    getAllSportTypes,
    getSingleSportType,
    updateSportType,
    deleteSportType,
};
