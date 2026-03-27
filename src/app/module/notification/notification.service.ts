import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const getMyNotifications = async (userId: string, query: IQueryParams) => {
  const model = prisma.notification;
  
  const notificationQuery = new QueryBuilder(model as any, query, {
      searchableFields: ["title", "message"],
      filterableFields: ["isRead", "type"],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .where({ userId });

  const result = await notificationQuery.execute();
  return result;
};

const markAsRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to access this notification!");
  }

  const result = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return result;
};

const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return result;
};

const deleteNotification = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to delete this notification!");
  }

  await prisma.notification.delete({
    where: { id },
  });

  return null;
};

export const NotificationService = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
