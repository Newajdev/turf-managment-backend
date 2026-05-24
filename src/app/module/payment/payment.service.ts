/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  BookingStatus,
  NotificationType,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import { sendEmail, EmailTemplate } from "../../utils/email";
import { NotificationService } from "../notification/notification.service";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findUnique({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(
      `Payment with Stripe Event ID ${event.id} already exists. Skipping processing.`,
    );
    return { success: true, message: "Event already processed" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;
      if (!bookingId || !paymentId) {
        console.error("Missing bookingId or paymentId in session metadata");
        return {
          success: false,
          message: "Missing bookingId or paymentId in session metadata",
        };
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          player: true,
          turf: true,
          turfSlot: { include: { slot: true } },
          customSlot: true,
        },
      });

      if (!booking) {
        console.error(`Booking with ID ${bookingId} not found`);
        return {
          success: false,
          message: `Booking with ID ${bookingId} not found`,
        };
      }

      const isPaid = session.payment_status === "paid";

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            ...(isPaid ? { status: BookingStatus.CONFIRMED } : {}),
          },
        });

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });

      if (isPaid && booking.player) {
        const owner = await prisma.turfOwner.findUnique({
          where: { id: booking.turf.ownerId },
        });

        if (owner) {
          NotificationService.createNotification({
            title: "Booking Confirmed",
            message: `Payment received for ${booking.turf.name} on ${booking.date.toDateString()}.`,
            userId: owner.userId,
            type: NotificationType.BOOKING,
          }).catch((err) => console.error("Owner notification error:", err));
        }

        await sendEmail({
          to: booking.player.email,
          subject: "Booking Confirmed - Turf Management",
          templateName: EmailTemplate.BookingConfirmation,
          templateData: {
            playerName: booking.player.name,
            turfName: booking.turf.name,
            date: booking.date.toDateString(),
            startTime:
              booking.turfSlot?.slot.startTime ??
              booking.customSlot?.startTime,
            endTime:
              booking.turfSlot?.slot.endTime ?? booking.customSlot?.endTime,
            price: booking.turfSlot?.price ?? booking.customSlot?.price,
          },
        }).catch((err) => console.error("Confirmation email error:", err));

        await sendEmail({
          to: booking.player.email,
          subject: "Payment Success - Turf Management",
          templateName: EmailTemplate.PaymentSuccess,
          templateData: {
            playerName: booking.player.name,
            transactionId: event.id,
            date: new Date().toDateString(),
            bookingId: bookingId,
            amount: (session.amount_total || 0) / 100,
            turfName: booking.turf.name,
          },
        }).catch((err) => console.error("Payment success email error:", err));
      }

      console.log(
        `Processed checkout.session.completed for booking ${bookingId}, paid=${isPaid}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      if (bookingId && paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        });
      }

      console.log(`Checkout session expired: ${session.id}`);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;
      const paymentId = paymentIntent.metadata?.paymentId;

      if (bookingId && paymentId) {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { player: true, turf: true },
        });

        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        });

        if (booking?.player) {
          NotificationService.createNotification({
            title: "Payment Failed",
            message: `Your payment for ${booking.turf.name} could not be processed. Please try again.`,
            userId: booking.player.userId,
            type: NotificationType.PAYMENT,
          }).catch((err) => console.error("Payment failure notification:", err));
        }
      }

      console.log(`Payment failed: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { success: true, message: "Event processed successfully" };
};

export const paymentService = {
  handleStripeWebhookEvent,
};
