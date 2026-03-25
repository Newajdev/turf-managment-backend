import { prisma } from '../../lib/prisma';
import { ISportType } from './sportType.interface';

const createSportType = async (payload: ISportType) => {
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
    const result = await prisma.sportType.findUniqueOrThrow({
        where: { id },
    });
    return result;
};

const updateSportType = async (id: string, payload: Partial<ISportType>) => {
    const result = await prisma.sportType.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteSportType = async (id: string) => {
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
