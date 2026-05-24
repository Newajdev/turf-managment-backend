/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

// Removed import of hardcoded templates; using file-based EJS templates.

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
});

export enum EmailTemplate {
  EmailVerificationOTP = "emailVerificationOTP",
  ForgotPasswordOTP = "forgotPasswordOTP",
  PasswordChanged = "password-changed",
  TurfOwnerCreated = "turfOwnerCreated",
  BookingConfirmation = "booking-confirmation",
  PaymentSuccess = "payment-success",
  MaintenanceAlert = "maintenance-alert",
}

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: EmailTemplate;
  templateData: Record<string, any>;
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
}: SendEmailOptions) => {
  try {
    // Previously fetched template string from hardcoded map. Now we will rely on renderFile to throw if file missing.
    // Ensure templateName is provided.
    if (!templateName) {
      throw new Error(`Template name is required`);
    }

    // Render the EJS template file
    const templatePath = path.resolve(
      __dirname,
      "../templates/emails",
      `${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: envVars.EMAIL_SENDER_SMTP_FROM,
      to,
      subject,
      html,
    });

transporter.verify((error) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});

  } catch (error: any) {
    console.log("Email Sending Error", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
