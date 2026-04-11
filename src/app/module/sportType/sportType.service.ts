import { prisma } from "../../lib/prisma";
import { ISportType } from "./sportType.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const createSportType = async (payload: ISportType) => {
  const isExist = await prisma.sportType.findFirst({
    where: {
         title: payload.title ,
    },
  });

  if (isExist) {
    throw new AppError(
      status.CONFLICT,
      "SportType with this title or icon already exists!",
    );
  }

  const result = await prisma.sportType.create({
    data: payload,
  });
  return result;
};

const getAllSportTypes = async (query: IQueryParams) => {
  const sportTypeQuery = new QueryBuilder(prisma.sportType as any, query, {
      searchableFields: ["title"],
      filterableFields: [],
  })
  .search()
  .filter()
  .sort()
  .paginate();

  const result = await sportTypeQuery.execute();
  return result;
};

const getSingleSportType = async (id: string) => {
  const result = await prisma.sportType.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "SportType not found");
  }

  return result;
};

const updateSportType = async (id: string, payload: Partial<ISportType>) => {
  const isExist = await prisma.sportType.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "SportType not found");
  }

  if (payload.title) {
    const conflictCheck = await prisma.sportType.findFirst({
      where: {
        title: payload.title,
        id: { not : id } ,
      },
    });
    if (conflictCheck) {
      throw new AppError(
        status.CONFLICT,
        "Another SportType with this title  exists!",
      );
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
    throw new AppError(status.NOT_FOUND, "SportType not found");
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
