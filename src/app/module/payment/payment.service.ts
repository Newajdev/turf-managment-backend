/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { sendEmail } from "../../utils/email";

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
      const session = event.data.object;

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
        include: { player: true, turf: true }
      });

      if (!booking) {
        console.error(`Booking with ID ${bookingId} not found`);
        return {
          success: false,
          message: `Booking with ID ${bookingId} not found`,
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });

      if (booking && booking.player) {
        await sendEmail({
          to: booking.player.email,
          subject: "Payment Success - Turf Management",
          templateName: "payment-success",
          templateData: {
            playerName: booking.player.name,
            transactionId: event.id,
            date: new Date().toDateString(),
            bookingId: bookingId,
            amount: (session.amount_total || 0) / 100,
            turfName: booking.turf.name
          },
        });
      }

      console.log(
        `Processed checkout.session.completed for booking ID ${bookingId} with payment status ${session.payment_status}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session expired for session ID ${session.id}`);
      break;
    }

    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(`Payment failed for session ID ${session.id}`);
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
