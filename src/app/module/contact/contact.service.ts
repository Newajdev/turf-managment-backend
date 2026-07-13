import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";

export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const submitContactForm = async (payload: ContactFormPayload) => {
  // Send email to admin
  await sendEmail({
    to: envVars.ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${payload.subject}`,
    templateName: "contact-form",
    templateData: {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
  });
};

export const ContactService = {
  submitContactForm,
};
