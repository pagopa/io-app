import { fromNullable } from "fp-ts/lib/Option";
import RNCalendarEvents from "react-native-calendar-events";
import { TranslationKeys } from "../../locales/locales";
import I18n from "../i18n";

/**
 * Utility functions to interact with the device calendars
 */

/**
 * A type that brings info about calendar authorization
 * asked means (when true) that the authorized values comes from user choise
 * otherwise comes from a previous recorded choice
 */
type CalendarAuthorization = { authorized: boolean; asked: boolean };

/**
 * A function that checks if the user has already permission to read/write to Calendars
 * and in case of not already defined permission try to get the authorization.
 */
export async function checkAndRequestPermission(): Promise<
  CalendarAuthorization
> {
  try {
    const status = await RNCalendarEvents.authorizationStatus();
    // If the user already selected to deny permission just return false
    if (status === "denied") {
      return { authorized: false, asked: false };
    }

    // If the permission is already granted return true
    if (status === "authorized") {
      return { authorized: true, asked: false };
    }

    // In other cases ask the authorization
    const newStatus = await RNCalendarEvents.authorizeEventStore();
    return { authorized: newStatus === "authorized", asked: true };
  } catch {
    return { authorized: false, asked: false };
  }
}

/**
 * Checks whether the app is authorized to read/write to system calendars.
 */
export async function checkCalendarPermission() {
  try {
    const status = await RNCalendarEvents.authorizationStatus();
    // If the permission is already granted return true
    return status === "authorized";
  } catch {
    return false;
  }
}

/**
 * This Type has been introduced after this story https://www.pivotaltracker.com/story/show/172079415
 * to solve the bug on some android devices (mostly the one running MIUI) naming their local calendar
 * with camel case notation this is a common situation as figured on a related reddit post
 * https://www.reddit.com/r/Xiaomi/comments/84jgdn/google_calendars_not_syncing_or_even_requesting/
 * and can be seen on MIUI's github repository
 * https://github.com/ChameleonOS/miui_framework/blob/master/java/miui/provider/ExtraCalendarContracts.java
 */

type CalendarTitleTranslation = { [key: string]: TranslationKeys };

const calendarTitleTranslations: CalendarTitleTranslation = {
  calendar_displayname_local: "profile.preferences.calendar.local_calendar",
  calendar_displayname_birthday:
    "profile.preferences.calendar.birthday_calendar"
};

export function convertLocalCalendarName(calendarTitle: string) {
  return fromNullable(
    calendarTitleTranslations[calendarTitle.trim().toLowerCase()]
  ).fold(calendarTitle, s => I18n.t(s));
}
