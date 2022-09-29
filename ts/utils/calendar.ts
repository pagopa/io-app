import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { Platform } from "react-native";
import { pipe } from "fp-ts/lib/function";
import { TranslationKeys } from "../../locales/locales";
import I18n from "../i18n";
import { AddCalendarEventPayload } from "../store/actions/calendarEvents";
import { CalendarEvent } from "../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { formatDateAsReminder } from "./dates";
import { showToast } from "./showToast";

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
export async function checkAndRequestPermission(): Promise<CalendarAuthorization> {
  try {
    const status = await RNCalendarEvents.checkPermissions();
    switch (status) {
      case "authorized":
        // the app is authorized to access the service
        return { authorized: true, asked: false };
      case "restricted":
        // the app is not authorized to access the service
        // (e.g. parental control on iOS or when the user
        // denies definitely on Android)
        return { authorized: false, asked: false };
      case "denied":
        // the user explicitly denied access to the service for the app
        if (Platform.OS === "ios") {
          return { authorized: false, asked: false };
        }
        // but in Android we can ask for it again
        // (i.e. shouldShowRequestPermissionRationale returns true)
        break;
      case "undetermined":
        // the user has not yet made a choice
        break;
      default:
        // let's try to request permissions as a fallback
        // if a new unhandled case arises
        break;
    }

    // if not returned yet, we can ask for the authorization
    const newStatus = await RNCalendarEvents.requestPermissions();
    return { authorized: newStatus === "authorized", asked: true };
  } catch {
    return { authorized: false, asked: false };
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
  return pipe(
    calendarTitleTranslations[calendarTitle.trim().toLowerCase()],
    O.fromNullable,
    O.fold(
      () => calendarTitle,
      s => I18n.t(s)
    )
  );
}

/**
 * return a TaskEither where left is an error
 * and right is a boolean -> true === the is in calendar
 * @param eventId
 */
export const isEventInCalendar = (
  eventId: string
): TE.TaskEither<Error, boolean> => {
  const authTask = TE.tryCatch(
    () => checkAndRequestPermission(),
    message => new Error(String(message))
  );
  const findTask = TE.tryCatch(
    () => RNCalendarEvents.findEventById(eventId),
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
  endDate: Date,
  title: string
): Promise<O.Option<string>> => {
  const startDate = new Date(endDate.getTime());
  return RNCalendarEvents.fetchAllEvents(
    formatDateAsReminder(new Date(startDate.setDate(endDate.getDate() - 1))),
    formatDateAsReminder(endDate)
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
  calendar: Calendar,
  message: CreatedMessageWithContentAndAttachments,
  dueDate: Date,
  title: string,
  onAddCalendarEvent?: (calendarEvent: AddCalendarEventPayload) => void
) => {
  const dueDateIsoString = dueDate.toISOString();
  RNCalendarEvents.saveEvent(title, {
    calendarId: calendar.id,
    startDate: dueDateIsoString,
    endDate: dueDateIsoString,
    allDay: true,
    alarms: []
  })
    .then(eventId => {
      showToast(
        I18n.t("messages.cta.reminderAddSuccess", {
          title,
          calendarTitle: convertLocalCalendarName(calendar.title)
        }),
        "success"
      );
      const messageId = message.id;
      if (onAddCalendarEvent) {
        onAddCalendarEvent({
          messageId,
          eventId
        });
      }
    })
    .catch(_ => showToast(I18n.t("messages.cta.reminderAddFailure"), "danger"));
};

export const removeCalendarEventFromDeviceCalendar = (
  calendarEvent: CalendarEvent | undefined,
  onRemoveEvent?: (calendarEvent: CalendarEvent) => void
) => {
  if (calendarEvent) {
    RNCalendarEvents.removeEvent(calendarEvent.eventId)
      .then(_ => {
        showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
        if (onRemoveEvent) {
          onRemoveEvent(calendarEvent);
        }
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
      );
  } else {
    showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger");
  }
};
