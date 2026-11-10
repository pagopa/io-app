import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { IOToast } from "@io-app/design-system";
import * as ExpoCalendar from "expo-calendar";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import { Platform } from "react-native";

import { AddCalendarEventPayload } from "../store/actions/calendarEvents";

/** Utility functions to interact with the device calendars */

/**
 * A type that brings info about calendar authorization asked means (when true)
 * that the authorized values comes from user choise otherwise comes from a
 * previous recorded choice
 */
type CalendarAuthorization = { asked: boolean; authorized: boolean };

/**
 * A function that checks if the user has already permission to read/write to
 * Calendars and in case of not already defined permission try to get the
 * authorization.
 */
export async function checkAndRequestPermission(): Promise<CalendarAuthorization> {
  try {
    const { status } = await ExpoCalendar.getCalendarPermissions();
    switch (status) {
      case "denied":
        // the user explicitly denied access to the service for the app
        if (Platform.OS === "ios") {
          return { authorized: false, asked: false };
        }
        // but in Android we can ask for it again
        // (i.e. shouldShowRequestPermissionRationale returns true)
        break;
      case "granted":
        // the app is authorized to access the service
        return { authorized: true, asked: false };
      // case "restricted":
      //   // the app is not authorized to access the service
      //   // (e.g. parental control on iOS or when the user
      //   // denies definitely on Android)
      //   return { authorized: false, asked: false };
      case "undetermined":
        // the user has not yet made a choice
        break;
      default:
        // let's try to request permissions as a fallback
        // if a new unhandled case arises
        break;
    }

    // if not returned yet, we can ask for the authorization
    const { status: calendarStatus } =
      await ExpoCalendar.requestCalendarPermissions();
    return {
      authorized: calendarStatus === "granted",
      asked: true
    };
  } catch {
    return { authorized: false, asked: false };
  }
}

/**
 * Translates the system names of the local and birthday calendars; any other
 * title is returned unchanged. Titles are matched ignoring case and spaces
 * because some Android devices (mostly MIUI) name their local calendar in camel
 * case, see https://www.pivotaltracker.com/story/show/172079415 and
 * https://github.com/ChameleonOS/miui_framework/blob/master/java/miui/provider/ExtraCalendarContracts.java
 */
export function convertLocalCalendarName(calendarTitle: string) {
  switch (calendarTitle.trim().toLowerCase()) {
    case "calendar_displayname_birthday":
      return I18n.t("profile.preferences.calendar.birthday_calendar");
    case "calendar_displayname_local":
      return I18n.t("profile.preferences.calendar.local_calendar");
    default:
      return calendarTitle;
  }
}

/**
 * Return a TaskEither where left is an error and right is a boolean -> true ===
 * the is in calendar
 *
 * @param eventId
 */
export const legacyIsEventInCalendar = (
  eventId: string
): TE.TaskEither<Error, boolean> => {
  const authTask = TE.tryCatch(
    () => checkAndRequestPermission(),
    message => new Error(String(message))
  );
  const findTask = TE.tryCatch(
    () => ExpoCalendar.ExpoCalendarEvent.get(eventId),
    E.toError
  );
  return pipe(
    authTask,
    TE.chain(
      TE.fromPredicate(
        auth => auth.authorized,
        () => new Error("Not authorized")
      )
    ),
    TE.chain(() => findTask),
    TE.map(ev => ev !== null)
  );
};
/**
 * Check if an event for endDate with that title already exists in the calendar.
 * Return the event id if it is found
 */
export const searchEventInCalendar = async (
  ids: Array<ExpoCalendar.ExpoCalendar["id"]>,
  endDate: Date,
  title: string
): Promise<O.Option<string>> => {
  const startDate = new Date(endDate.getTime());
  return ExpoCalendar.listEvents(
    ids,
    new Date(startDate.setDate(endDate.getDate() - 1)),
    endDate
  )
    .then(
      events =>
        pipe(
          events,
          O.fromNullable,
          O.chainNullableK(evs =>
            evs.find(
              e =>
                e.title === title &&
                e.endDate &&
                new Date(e.endDate).getDay() === endDate.getDay()
            )
          ),
          O.map(ev => O.some(ev.id)),
          O.getOrElseW(() => O.none)
        ),
      // handle promise rejection
      () => O.none
    )
    .catch(() => O.none);
};

export const saveCalendarEvent = (
  calendar: ExpoCalendar.ExpoCalendar,
  message: CreatedMessageWithContentAndAttachments,
  dueDate: Date,
  title: string,
  onAddCalendarEvent?: (calendarEvent: AddCalendarEventPayload) => void
) => {
  const dueDateIsoString = dueDate.toISOString();
  calendar
    .createEvent({
      title,
      calendarId: calendar.id,
      startDate: dueDateIsoString,
      endDate: dueDateIsoString,
      allDay: true,
      alarms: []
    })
    .then(event => {
      IOToast.success(
        I18n.t("messages.cta.reminderAddSuccess", {
          title,
          calendarTitle: convertLocalCalendarName(calendar.title)
        })
      );
      const messageId = message.id;
      if (onAddCalendarEvent) {
        onAddCalendarEvent({
          messageId,
          eventId: event.id
        });
      }
    })
    .catch(_ => IOToast.error(I18n.t("messages.cta.reminderAddFailure")));
};

/**
 * Check and request the permission to access the device calendar
 *
 * @returns A boolean that is true if the permission is granted
 */
export const requestCalendarPermission = async (): Promise<boolean> => {
  const { status: calendarResult } =
    await ExpoCalendar.getCalendarPermissions();

  if (calendarResult === "granted") {
    return true;
  }

  const { status: requestCalendarStatus } =
    await ExpoCalendar.requestCalendarPermissions();
  return requestCalendarStatus === "granted";
};

/** Check if the event is in the device calendar */
export const isEventInCalendar = (eventId: string) =>
  pipe(
    TE.tryCatch(() => requestCalendarPermission(), E.toError),
    TE.chain(TE.fromPredicate(identity, () => Error("Permission not granted"))),
    TE.chain(() =>
      TE.tryCatch(() => ExpoCalendar.ExpoCalendarEvent.get(eventId), E.toError)
    ),
    TE.map(ev => ev !== null)
  );

/** Add an event to the device calendar */
export const saveEventToDeviceCalendarTask = (
  calendar: ExpoCalendar.ExpoCalendar,
  dueDate: Date,
  title: string
) =>
  TE.tryCatch(
    () =>
      calendar.createEvent({
        title,
        calendarId: calendar.id,
        startDate: dueDate.toISOString(),
        endDate: dueDate.toISOString(),
        allDay: true,
        alarms: []
      }),
    E.toError
  );

/** Remove an event from the device calendar */
export const removeEventFromDeviceCalendarTask = (
  event: ExpoCalendar.ExpoCalendarEvent
) =>
  pipe(
    TE.tryCatch(() => event.delete(), E.toError),
    TE.map(_ => event.id)
  );

/** Find the device calendars */
export const findDeviceCalendarsTask = TE.tryCatch(
  () => ExpoCalendar.getCalendars(),
  E.toError
);
