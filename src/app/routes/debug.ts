import { Router } from "express";
import { sendEmail } from "../utils/email";
import { envVars } from "../config/env";

const debugRouter = Router();

// Simple endpoint to trigger a test email in production
debugRouter.get("/email", async (req, res) => {
  try {
    await sendEmail({
      to: envVars.ADMIN_EMAIL,
      subject: "Production Test Email",
      templateName: "emailVerificationOTP",
      templateData: { otp: "123456", name: "Test" },
    });
    res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    console.error("Debug email error:", err);
    res.status(500).json({ success: false, error: err || "Unknown error" });
  }
});

export const DebugRoutes = debugRouter;
