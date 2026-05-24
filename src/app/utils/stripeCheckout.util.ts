import { stripe } from "../config/stripe.config";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { status } from "http-status";

export const createStripeCheckoutSession = async (params: {
  productName: string;
  amount: number;
  bookingId: string;
  paymentId: string;
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: envVars.STRIPE_CURRENCY,
            product_data: {
              name: params.productName,
            },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: params.bookingId,
        paymentId: params.paymentId,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payments/payment-success?booking_id=${params.bookingId}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/bookings`,
    });

    if (!session.url) {
      throw new AppError(
        status.BAD_GATEWAY,
        "Payment session was created but no checkout URL was returned.",
      );
    }

    return session.url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      status.BAD_GATEWAY,
      "Payment session could not be created. Please try again.",
    );
  }
};
