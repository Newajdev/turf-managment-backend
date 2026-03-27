import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IReport } from "./report.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const createReport = async (userId: string, payload: IReport) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const turf = await prisma.turf.findUnique({
    where: { id: payload.turfId },
  });

  if (!turf) {
    throw new AppError(status.NOT_FOUND, "Turf not found!");
  }

  const result = await prisma.report.create({
    data: {
      ...payload,
      playerId: player.id,
    },
    include: {
      turf: true,
    },
  });

  return result;
};

const getAllReports = async (query: IQueryParams) => {
  const reportQuery = new QueryBuilder(prisma.report as any, query, {
    searchableFields: ["description"],
    filterableFields: ["reason"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      player: { include: { user: true } },
      turf: true,
    });

  const result = await reportQuery.execute();
  return result;
};

const getMyReports = async (userId: string) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const result = await prisma.report.findMany({
    where: { playerId: player.id },
    include: { turf: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const deleteReport = async (userId: string, id: string, role: string) => {
  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    throw new AppError(status.NOT_FOUND, "Report not found!");
  }

  if (role !== "SYSTEM_ADMIN") {
    const player = await prisma.player.findUnique({ where: { userId } });
    if (!player || report.playerId !== player.id) {
      throw new AppError(status.FORBIDDEN, "You are not authorized to delete this report!");
    }
  }

  await prisma.report.delete({ where: { id } });
  return null;
};

export const ReportService = {
  createReport,
  getAllReports,
  getMyReports,
  deleteReport,
};
