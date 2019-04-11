import { differenceInCalendarDays, format } from "date-fns";
import { formatDateAsLocal } from "./dates";

/**
 * This function converts the distance from now to date in : H.mm, yesterday, D/MM/YY and DD/MM
 *  TODO: Make date consistent with the timezone
 *  https://www.pivotaltracker.com/story/show/158389284
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
