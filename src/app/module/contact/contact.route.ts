import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { ContactValidation } from "./contact.validation";
import { ContactController } from "./contact.controller";


const router = Router();

router.post(
  "/",
  validateRequest(ContactValidation.createContactSchema),
  ContactController.submitContactForm
);

export const ContactRoutes = router;
