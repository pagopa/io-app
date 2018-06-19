import { differenceInCalendarDays, format } from "date-fns";
import I18n from "../i18n";
/**
 * This function converts the distance from now to date in : H.mm, yesterday, D/MM/YY and DD/MM
 *  TODO: Make date consistent with the timezone
 *  https://www.pivotaltracker.com/story/show/158389284
 */
export function convertDateToWordDistance(date: Date): string {
  const distance = differenceInCalendarDays(new Date(), date);
  // 0 days, distance < one day
  if (distance < 1) {
    return format(date, "H.mm");
  } // distance = 1 day
  else if (distance === 1) {
    return I18n.t("messages.yesterday");
  } // 1 day < distance < 365 days, current year
  else if (distance > 1 && distance < 365) {
    return format(date, "DD/MM");
  } // distance > current year
  else {
    return format(date, "DD/MM/YY");
  }
}
