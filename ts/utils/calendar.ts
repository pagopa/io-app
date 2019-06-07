import RNCalendarEvents from "react-native-calendar-events";

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
  } catch (error) {
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
  } catch (error) {
    return false;
  }
}
