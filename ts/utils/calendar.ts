import RNCalendarEvents from "react-native-calendar-events";

/**
 * Utility functions to interact with the device calendars
 */

/**
 * A function that checks if the user has already permission to read/write to Calendars
 * and in case of not already defined permission try to get the authorization.
 */
export async function checkAndRequestPermission() {
  try {
    const status = await RNCalendarEvents.authorizationStatus();
    // If the user already selected to deny permission just return false
    if (status === "denied") {
      return false;
    }

    // If the permission is already granted return true
    if (status === "authorized") {
      return true;
    }

    // In other cases ask the authorization
    const newStatus = await RNCalendarEvents.authorizeEventStore();
    return newStatus === "authorized";
  } catch (error) {
    return false;
  }
}
