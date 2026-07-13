import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { PaymentStatus, BookingStatus } from "../../../generated/prisma/enums";

const getAdminAnalytics = async () => {
    const [totalRevenue, totalPlayers, totalTurfOwners, totalTurfs, bookingsByStatus] = await Promise.all([
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: PaymentStatus.PAID }
        }),
        prisma.player.count(),
        prisma.turfOwner.count(),
        prisma.turf.count(),
        prisma.booking.groupBy({
            by: ['status'],
            _count: { _all: true }
        })
    ]);

    return {
        revenue: totalRevenue?._sum?.amount || 0,
        users: {
            players: totalPlayers,
            owners: totalTurfOwners,
            total: totalPlayers + totalTurfOwners
        },
        turfs: {
            total: totalTurfs
        },
        bookings: bookingsByStatus.reduce((acc, curr) => {
            acc[curr.status.toLowerCase()] = curr._count._all;
            return acc;
        }, {} as Record<string, number>)
    };
};
const getState = async () => {
    const [totalPlayers, totalTurfOwners, totalTurfs, bookingsByStatus] = await Promise.all([
        prisma.player.count(),
        prisma.turfOwner.count(),
        prisma.turf.count(),
        prisma.booking.groupBy({
            by: ['status'],
            _count: { _all: true }
        })
    ]);

    return {
        totalUsers: totalPlayers + totalTurfOwners,
        totalTurfs: totalTurfs,
        bookings: bookingsByStatus.reduce((acc, curr) => {
            acc[curr.status.toLowerCase()] = curr._count._all;
            return acc;
        }, {} as Record<string, number>)
    };
};

const getOwnerAnalytics = async (userId: string) => {
    const owner = await prisma.turfOwner.findUnique({
        where: { userId }
    });

    if (!owner) {
        throw new AppError(status.FORBIDDEN, "Only turf owners can access owner analytics!");
    }

    const ownerTurfs = await prisma.turf.findMany({
        where: { ownerId: owner.id },
        select: { id: true }
    });

    const turfIds = ownerTurfs.map(t => t.id);

    const [revenue, bookings, reviews] = await Promise.all([
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                booking: { turfId: { in: turfIds } },
                status: PaymentStatus.PAID
            }
        }),
        prisma.booking.count({
            where: { turfId: { in: turfIds } }
        }),
        prisma.review.aggregate({
            _avg: { rating: true },
            where: { turfId: { in: turfIds } }
        })
    ]);

    return {
        revenue: revenue?._sum?.amount || 0,
        totalBookings: bookings,
        averageRating: reviews._avg?.rating || 0,
        turfCount: turfIds.length
    };
};

const getPlayerAnalytics = async (userId: string) => {
    const player = await prisma.player.findUnique({
        where: { userId }
    });

    if (!player) {
        throw new AppError(status.FORBIDDEN, "Only players can access player analytics!");
    }

    const [totalBookings, upcomingBookings, totalSpent, recentBookings] = await Promise.all([
        prisma.booking.count({
            where: { playerId: player.id }
        }),
        prisma.booking.count({
            where: { 
                playerId: player.id,
                date: { gte: new Date() },
                status: BookingStatus.CONFIRMED
            }
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                booking: { playerId: player.id },
                status: PaymentStatus.PAID
            }
        }),
        prisma.booking.findMany({
            where: { playerId: player.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                turf: true,
                turfSlot: { include: { slot: true } }
            }
        })
    ]);

    return {
        totalBookings,
        upcomingBookings,
        totalSpent: totalSpent?._sum?.amount || 0,
        recentBookings
    };
};

export const AnalyticsService = {
    getAdminAnalytics,
    getState,
    getOwnerAnalytics,
    getPlayerAnalytics
};
