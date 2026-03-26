import { prisma } from '../../lib/prisma';
import { ISportType } from './sportType.interface';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status';

const createSportType = async (payload: ISportType) => {
    const isExist = await prisma.sportType.findFirst({
        where: {
            OR: [
                { title: payload.title },
                ...(payload.icon ? [{ icon: payload.icon }] : [])
            ]
        }
    });

    if (isExist) {
        throw new AppError(httpStatus.CONFLICT, "SportType with this title or icon already exists!");
    }

    const result = await prisma.sportType.create({
        data: payload,
    });
    return result;
};

const getAllSportTypes = async () => {
    const result = await prisma.sportType.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return result;
};

const getSingleSportType = async (id: string) => {
    const result = await prisma.sportType.findUnique({
        where: { id },
    });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "SportType not found");
    }

    return result;
};

const updateSportType = async (id: string, payload: Partial<ISportType>) => {
    const isExist = await prisma.sportType.findUnique({
        where: { id },
    });

    if (!isExist) {
        throw new AppError(httpStatus.NOT_FOUND, "SportType not found");
    }

    if (payload.title || payload.icon) {
        const conflictCheck = await prisma.sportType.findFirst({
            where: {
                id: { not: id },
                OR: [
                    ...(payload.title ? [{ title: payload.title }] : []),
                    ...(payload.icon ? [{ icon: payload.icon }] : [])
                ]
            }
        });
        if (conflictCheck) {
            throw new AppError(httpStatus.CONFLICT, "Another SportType with this title or icon already exists!");
        }
    }

    const result = await prisma.sportType.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteSportType = async (id: string) => {
    const isExist = await prisma.sportType.findUnique({
        where: { id },
    });

    if (!isExist) {
        throw new AppError(httpStatus.NOT_FOUND, "SportType not found");
    }

    const result = await prisma.sportType.delete({
        where: { id },
    });
    return result; 
};

export const SportTypeService = {
    createSportType,
    getAllSportTypes,
    getSingleSportType,
    updateSportType,
    deleteSportType,
};
