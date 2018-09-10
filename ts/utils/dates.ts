import { format } from "date-fns";

export function formatDateAsMonth(date: Date): string {
  return format(date, "MMM");
}

export function formatDateAsDay(date: Date): string {
  return format(date, "DD");
}

export function formatDateAsReminder(date: Date): string {
  return format(date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}
