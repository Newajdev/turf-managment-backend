import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { IReview } from "./review.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  BookingStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";

const updateTurfRatingAggregates = async (turfId: string) => {
  const stats = await prisma.review.aggregate({
    where: { turfId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.turf.update({
    where: { id: turfId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count.id,
    },
  });
};

const createReview = async (userId: string, payload: IReview) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found!");
  }

  if (booking.playerId !== player.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to review this booking!",
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review completed bookings!",
    );
  }

  if (booking.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review paid bookings!",
    );
  }

  if (booking.turfId !== payload.turfId) {
    throw new AppError(status.BAD_REQUEST, "Turf ID does not match this booking!");
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (existingReview) {
    throw new AppError(
      status.CONFLICT,
      "You have already reviewed this booking!",
    );
  }

  const result = await prisma.review.create({
    data: {
      ...payload,
      playerId: player.id,
    },
  });

  await updateTurfRatingAggregates(payload.turfId);

  return result;
};

const getTurfReviews = async (turfId: string, query: IQueryParams) => {
  const reviewQuery = new QueryBuilder(prisma.review as any, query, {
    searchableFields: ["comment"],
    filterableFields: ["rating"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ turfId })
    .include({
      player: {
        include: { user: true },
      },
    });

  const result = await reviewQuery.execute();
  return result;
};

const getMyReviews = async (userId: string, query: IQueryParams) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const reviewQuery = new QueryBuilder(prisma.review as any, query, {
    searchableFields: ["comment"],
    filterableFields: ["rating"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ playerId: player.id })
    .include({
      turf: true,
      booking: true,
    });

  const result = await reviewQuery.execute();
  return result;
};

const updateReview = async (
  userId: string,
  id: string,
  payload: Partial<IReview>,
) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review || review.playerId !== player.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this review!",
    );
  }

  const result = await prisma.review.update({
    where: { id },
    data: payload,
  });

  await updateTurfRatingAggregates(review.turfId);

  return result;
};

const deleteReview = async (userId: string, id: string) => {
  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found!");
  }

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review || review.playerId !== player.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this review!",
    );
  }

  const turfId = review.turfId;

  await prisma.review.delete({ where: { id } });
  await updateTurfRatingAggregates(turfId);

  return null;
};

export const ReviewService = {
  createReview,
  getTurfReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
