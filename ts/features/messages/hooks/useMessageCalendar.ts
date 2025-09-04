import { useCallback } from "react";
import { Alert } from "react-native";
import { Calendar } from "react-native-calendar-events";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import {
  searchEventInCalendar,
  convertLocalCalendarName,
  saveEventToDeviceCalendarTask,
  removeEventFromDeviceCalendarTask
} from "../../../utils/calendar";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { CalendarEvent } from "../../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../../store/reducers/persistedPreferences";
import {
  AddCalendarEventPayload,
  addCalendarEvent,
  removeCalendarEvent
} from "../../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../../store/actions/persistedPreferences";

export const useMessageCalendar = (messageId: string) => {
  const dispatch = useIODispatch();

  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const handleAddEventToCalendar = useCallback(
    (calendarEvent: AddCalendarEventPayload) =>
      dispatch(addCalendarEvent(calendarEvent)),
    [dispatch]
  );

  const handleRemoveEventFromCalendar = useCallback(
    (event: CalendarEvent) =>
      dispatch(removeCalendarEvent({ messageId: event.messageId })),
    [dispatch]
  );

  const setPreferredCalendar = useCallback(
    (calendar: Calendar) =>
      dispatch(
        preferredCalendarSaveSuccess({
          preferredCalendar: calendar
        })
      ),
    [dispatch]
  );

  const onAddEventToCalendar = (
    calendar: Calendar,
    dueDate: Date,
    title: string
  ) => {
    void pipe(
      saveEventToDeviceCalendarTask(calendar.id, dueDate, title),
      TE.map(eventId => {
        IOToast.success(
          I18n.t("messages.cta.reminderAddSuccess", {
            title,
            calendarTitle: convertLocalCalendarName(calendar.title)
          })
        );

        // add event to the store
        handleAddEventToCalendar({ messageId, eventId });
      }),
      TE.mapLeft(() => IOToast.error(I18n.t("messages.cta.reminderAddFailure")))
    )();
  };

  const handleConfirmAddEventToCalendar = (
    dueDate: Date,
    eventId: string,
    calendar: Calendar,
    title: string
  ) => {
    Alert.alert(
      I18n.t("messages.cta.reminderAlertTitle"),
      I18n.t("messages.cta.reminderAlertDescription"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("messages.cta.reminderAlertKeep"),
          style: "default",
          onPress: () => {
            // add event to the store
            handleAddEventToCalendar({
              messageId,
              eventId
            });
          }
        },
        {
          text: I18n.t("messages.cta.reminderAlertAdd"),
          style: "default",
          onPress: () => onAddEventToCalendar(calendar, dueDate, title)
        }
      ],
      { cancelable: false }
    );
  };

  const addEventToCalendar = (
    dueDate: Date,
    eventTitle: string,
    calendar: Calendar
  ) => {
    void pipe(
      TE.tryCatch(() => searchEventInCalendar(dueDate, eventTitle), E.toError),
      TE.chain(TE.fromOption(() => new Error("Event not found"))),
      TE.map(eventId =>
        handleConfirmAddEventToCalendar(dueDate, eventId, calendar, eventTitle)
      ),
      TE.mapLeft(() => onAddEventToCalendar(calendar, dueDate, eventTitle))
    )();
  };

  const removeEventFromCalendar = (
    calendarEvent: CalendarEvent | undefined
  ) => {
    void pipe(
      calendarEvent?.eventId,
      TE.fromNullable(Error("calendarEvent not defined")),
      TE.chain(removeEventFromDeviceCalendarTask),
      TE.map(eventId => {
        IOToast.success(I18n.t("messages.cta.reminderRemoveSuccess"));

        handleRemoveEventFromCalendar({ messageId, eventId });
      }),
      TE.mapLeft(() =>
        IOToast.error(I18n.t("messages.cta.reminderRemoveFailure"))
      )
    )();
  };

  return {
    preferredCalendar,
    setPreferredCalendar,
    addEventToCalendar,
    removeEventFromCalendar
  };
};
