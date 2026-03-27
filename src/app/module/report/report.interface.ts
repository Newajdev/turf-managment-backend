import { ReportReason } from "../../../generated/prisma/enums";

export interface IReport {
  reason: ReportReason;
  description: string;
  turfId: string;
}
