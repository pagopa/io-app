import { differenceInCalendarDays } from "date-fns";
import I18n from "../i18n";
import { format, formatDateAsLocal } from "./dates";

/**
 * This function converts the distance from now to date in :
 * H.mm, yesterday, MM/DD (or DD/MM) and MM/DD/YY (or DD/MM/YY) depending on the system locale
 */
export function convertDateToWordDistance(
  date: Date,
  lastDayLabel: string,
  todayAtLabel?: string,
  invalidDateLabel?: string
): string {
  const distance = differenceInCalendarDays(new Date(), date);
  // 0 days, distance < one day
  if (distance < 1) {
    const formatted = format(date, "H.mm");
    return todayAtLabel ? `${todayAtLabel} ${formatted}` : formatted;
  } // distance = 1 day
  else if (distance === 1) {
    return lastDayLabel;
  } // 1 day < distance < 365 days, current year
  else if (distance > 1 && distance < 365) {
    return formatDateAsLocal(date);
  } // the original date is invalid (distance is NaN)
  else if (isNaN(distance)) {
    return invalidDateLabel ? invalidDateLabel : format(date);
  } else {
    // distance > current year
    return formatDateAsLocal(date, true);
  }
}

/**
 * Convert a received {@link Date} in an accessible format
 * @param date
 */
export const convertReceivedDateToAccessible = (date: Date) => {
  const distance = differenceInCalendarDays(new Date(), date);
  // 0 days, distance < one day
  if (distance < 1) {
    return `${I18n.t("messages.accessibility.message.received_at")} ${format(
      date,
      "H:mm"
    )}`;
  }
  return `${I18n.t("messages.accessibility.message.received_on")} ${format(
    date,
    I18n.t("messages.accessibility.message.date_format")
  )}`;
};
