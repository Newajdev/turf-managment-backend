/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import sgMail from "@sendgrid/mail";
import path from "path";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";

sgMail.setApiKey(envVars.SENDGRID_API_KEY!);

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

    const msg: any = {
      to,
      from: envVars.EMAIL_FROM,
      subject,
      html,
    };

    if (attachments && attachments.length) {
      msg.attachments = attachments.map((a) => ({
        content: Buffer.isBuffer(a.content)
          ? a.content.toString("base64")
          : Buffer.from(a.content as string).toString("base64"),
        filename: a.filename,
        type: a.contentType,
        disposition: "attachment",
      }));
    }

    const [response] = await sgMail.send(msg);
    console.log("SendGrid response", response);
  } catch (error: any) {
    console.error("FULL EMAIL ERROR:", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
