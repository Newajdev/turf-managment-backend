/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  secure: envVars.EMAIL_SENDER_SMTP_SECURE,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
  port: envVars.EMAIL_SENDER_SMTP_PORT,
}as any);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(
  __dirname,
  "..",
  "templates",
  "emails",
  `${templateName}.ejs`,
);

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    transporter.verify((error) => {
      if (error) {
        console.error("SMTP VERIFY ERROR:", error);
      } else {
        console.log("SMTP SERVER READY");
      }
    });

    console.log(info)

   
  } catch (error: any) {
    console.error("FULL EMAIL ERROR:", error);
    
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");

  }
};
