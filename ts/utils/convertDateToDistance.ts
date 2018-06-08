import { differenceInCalendarDays, format } from "date-fns";
import I18n from "../i18n";

// This function convert the distance from now to date in : H.mm, yesterday, D/MM/YY and DD/MM
export function convertDateToDistance(date: string): string {
  const distance = differenceInCalendarDays(new Date(), new Date(date));
  // 0 days, distance < 24h
  if (distance < 1) {
    return format(new Date(date), "H.mm");
  } // distance = 1 day
  else if (distance === 1) {
    return I18n.t("messages.yesterday");
  } // 1 day < distance < 365, current year
  else if (distance > 1 && distance < 365) {
    return format(new Date(date), "D/MM");
  } // distance > current year
  else {
    return format(new Date(date), "DD/MM/YY");
  }
}
