import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { ContactService } from "./contact.service";

const submitContactForm = catchAsync(async (req: Request, res: Response) => {
  await ContactService.submitContactForm(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your message has been sent successfully. We will get back to you soon.",
  });
});

export const ContactController = {
  submitContactForm,  
};
