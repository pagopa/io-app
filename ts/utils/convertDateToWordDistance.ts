import { differenceInCalendarDays } from "date-fns";
import I18n from "../i18n";
import { dateToAccessibilityReadableFormat } from "./accessibility";
import { format, formatDateAsLocal } from "./dates";
import { maybeNotNullyString } from "./strings";
import { localeDateFormat } from "./locale";

/**
 * This function converts the distance from now to date in :
 * H.mm, yesterday, MM/DD (or DD/MM) and MM/DD/YYYY (or DD/MM/YYYY) depending on the system locale
 */

export function convertDateToWordDistance(
  date: Date,
  lastDayLabel: string,
  invalidDateLabel?: string,
  todayAtLabel?: string
): string {
  const today = new Date();
  const distance = differenceInCalendarDays(today, date);
  // 0 days, distance < one day
  if (distance < 1) {
    const formatted = format(date, "H:mm");
    return maybeNotNullyString(todayAtLabel).fold(
      formatted,
      result => `${result} ${formatted}`
    );
  } // distance = 1 day
  else if (distance === 1) {
    return lastDayLabel;
  } // 1 day < distance, year is the current year
  else if (distance > 1 && date.getFullYear() === today.getFullYear()) {
    return localeDateFormat(
      date,
      I18n.t("global.dateFormats.dayMonthWithoutTime")
    );
  } else if (isNaN(distance)) {
    return maybeNotNullyString(invalidDateLabel).fold(
      I18n.t("datetimes.notValid"),
      result => result
    );
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
  return `
    ${I18n.t(
      "messages.accessibility.message.received_on"
    )} ${dateToAccessibilityReadableFormat(date)}
  `;
};
