import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { status } from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";

const getAdminAnalytics = async () => {
    const [totalRevenue, totalPlayers, totalTurfOwners, totalTurfs, bookingsByStatus] = await Promise.all([
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: PaymentStatus.SUCCESS }
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
                status: PaymentStatus.SUCCESS
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

export const AnalyticsService = {
    getAdminAnalytics,
    getOwnerAnalytics
};
