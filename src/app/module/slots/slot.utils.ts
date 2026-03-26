import { isValid, parse } from "date-fns";

export const parseTime = (timeStr: string, referenceDate: Date) => {
  const formats = ["hh:mm a", "HH:mm", "h:mm a", "H:mm"];
  for (const fmt of formats) {
    const parsed = parse(timeStr, fmt, referenceDate);
    if (isValid(parsed)) return parsed;
  }
  return null;
};