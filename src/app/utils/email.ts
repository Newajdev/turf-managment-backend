/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import dns from "dns/promises";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";

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

// Helper to create a transporter (forces IPv4)
async function createTransporter() {
  // Resolve host to IPv4 address to avoid IPv6 ENETUNREACH
  let smtpHost = envVars.EMAIL_SENDER_SMTP_HOST;
  try {
    const ipv4 = await dns.resolve4(envVars.EMAIL_SENDER_SMTP_HOST);
    if (ipv4.length) smtpHost = ipv4[0];
  } catch {
    // fallback to original host if DNS resolution fails
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
    secure: Number(envVars.EMAIL_SENDER_SMTP_PORT) === 465,
    requireTLS: Number(envVars.EMAIL_SENDER_SMTP_PORT) !== 465,
    family: 4,
    auth: {
      user: envVars.EMAIL_SENDER_SMTP_USER,
      pass: envVars.EMAIL_SENDER_SMTP_PASS,
    },
  } as any);

  console.log("Nodemailer transporter configured", {
    host: smtpHost,
    port: envVars.EMAIL_SENDER_SMTP_PORT,
    secure: Number(envVars.EMAIL_SENDER_SMTP_PORT) === 465,
    requireTLS: Number(envVars.EMAIL_SENDER_SMTP_PORT) !== 465,
    user: envVars.EMAIL_SENDER_SMTP_USER,
  });

  return transport;
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", "emails", `${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    // primary transport
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER_SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    transporter.verify((error, success) => {
      if (error) console.error("SMTP VERIFY ERROR:", error);
      else console.log("SMTP SERVER READY:", success);
    });

    console.log("Email sent info:", info);
  } catch (error: any) {
    console.error("FULL EMAIL ERROR:", error);
    // retry with fallback config (port 587) if IPv6 unreachable
    if (error.code === "ESOCKET" && error.message?.includes("ENETUNREACH")) {
      console.warn("ENETUNREACH detected – retrying with alternative SMTP config (port 587)");
      const altTransport = nodemailer.createTransport({
        host: envVars.EMAIL_SENDER_SMTP_HOST,
        port: 587,
        secure: false,
        requireTLS: true,
        family: 4,
        auth: {
          user: envVars.EMAIL_SENDER_SMTP_USER,
          pass: envVars.EMAIL_SENDER_SMTP_PASS,
        },
      } as any);
      try {
        const altInfo = await altTransport.sendMail({
          from: envVars.EMAIL_SENDER_SMTP_FROM,
          to,
          subject,
          html: await ejs.renderFile(
            path.join(__dirname, "..", "templates", "emails", `${templateName}.ejs`),
            templateData
          ),
          attachments: attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
          })),
        });
        console.log("Alternative transport succeeded:", altInfo);
        return;
      } catch (altErr) {
        console.error("Alternative transport failed:", altErr);
      }
    }
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
