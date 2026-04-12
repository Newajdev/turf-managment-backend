import { Router } from "express";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { ReportController } from "./report.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ReportValidations } from "./report.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PLAYER),
  validateRequest(ReportValidations.createReportSchema),
  ReportController.createReport,
);

router.get("/", checkAuth(Role.SYSTEM_ADMIN), ReportController.getAllReports);

router.get("/my-reports", checkAuth(Role.PLAYER), ReportController.getMyReports);

router.delete("/:id", checkAuth(Role.SYSTEM_ADMIN), ReportController.deleteReport);

export const ReportRoutes = router;
