import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { sendResponse } from "./app/shared/sendResponse";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";



const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())

app.use("/api/v1", IndexRoutes);

// base route
app.get("/", async (req: Request, res: Response) => {
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Turf Backend Api is Running.",
  });
});

app.use(globalErrorHandler)
app.use(notFound)

export default app;
