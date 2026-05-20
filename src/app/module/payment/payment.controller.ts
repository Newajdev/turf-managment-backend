/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import e, { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import  Stripe  from "stripe";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";
import { se } from "date-fns/locale";

const handleStripeWebhookEvent = catchAsync(
    async (req: Request, res: Response) => {
        const signature = req.headers["stripe-signature"];
        const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.error("Missing Stripe signature or webhook secret");
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: "Missing Stripe signature or webhook secret",
            });
        }

        let event;
        try {
            event = Stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret,
            );
        } catch (error: any) {
            console.error("Error verifying Stripe webhook signature:", error);
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: "Invalid Stripe webhook signature",
            });
        }

        try {
            const result = await paymentService.handleStripeWebhookEvent(event);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: result.success,
                message: result.message,
                data: result
            });
            
        }catch (error) {
            console.error("Error processing Stripe webhook event:", error);
            sendResponse(res, {
                httpStatusCode: status.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Error processing Stripe webhook event"
            });
        }
        
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
