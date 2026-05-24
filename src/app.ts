import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { sendResponse } from "./app/shared/sendResponse";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { PaymentController } from "./app/module/payment/payment.controller";

const app: Application = express();
app.set("trust proxy", 1);


app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

app.use("/api/v1/auth/login", authRateLimiter);
app.use("/api/v1/auth/register-player", authRateLimiter);
app.use("/api/v1/auth/forgot-password", authRateLimiter);
app.use("/api/v1/auth/resend-verification-otp", authRateLimiter);

app.use(express.json());


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", toNodeHandler(auth));


app.use("/api/v1", IndexRoutes);

// base route
app.get("/", async (req: Request, res: Response) => {
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Turf Backend Api is Running.",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
