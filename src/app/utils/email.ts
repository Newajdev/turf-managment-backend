/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

import { emailTemplates } from "../templates/emailTemplates";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
}: SendEmailOptions) => {
  try {
    const templateString = emailTemplates[templateName];

    if (!templateString) {
      throw new Error(`Template ${templateName} not found`);
    }

    const html = ejs.render(templateString, templateData);

    await transporter.sendMail({
      from: envVars.EMAIL_SENDER_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
    });
  } catch (error: any) {
    console.log("Email Sending Error", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
