import { IOToast } from "@io-app/design-system";
import * as ExpoCalendar from "expo-calendar";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert } from "react-native";

import {
  addCalendarEvent,
  AddCalendarEventPayload,
  removeCalendarEvent
} from "../../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { CalendarEvent } from "../../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../../store/reducers/persistedPreferences";
import {
  convertLocalCalendarName,
  removeEventFromDeviceCalendarTask,
  saveEventToDeviceCalendarTask,
  searchEventInCalendar
} from "../../../utils/calendar";

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
    (calendar: ExpoCalendar.ExpoCalendar) =>
      dispatch(
        preferredCalendarSaveSuccess({
          preferredCalendar: calendar
        })
      ),
    [dispatch]
  );

  const onAddEventToCalendar = (
    calendar: ExpoCalendar.ExpoCalendar,
    dueDate: Date,
    title: string
  ) => {
    void pipe(
      saveEventToDeviceCalendarTask(calendar, dueDate, title),
      TE.map(event => {
        IOToast.success(
          I18n.t("messages.cta.reminderAddSuccess", {
            title,
            calendarTitle: convertLocalCalendarName(calendar.title)
          })
        );

        // add event to the store
        handleAddEventToCalendar({ messageId, eventId: event.id });
      }),
      TE.mapLeft(() => IOToast.error(I18n.t("messages.cta.reminderAddFailure")))
    )();
  };

  const handleConfirmAddEventToCalendar = (
    dueDate: Date,
    eventId: string,
    calendar: ExpoCalendar.ExpoCalendar,
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
    calendar: ExpoCalendar.ExpoCalendar
  ) => {
    void pipe(
      TE.tryCatch(
        () => searchEventInCalendar([calendar.id], dueDate, eventTitle),
        E.toError
      ),
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
    if (calendarEvent) {
      ExpoCalendar.ExpoCalendarEvent.get(calendarEvent.eventId)
        .then(event => removeEventFromDeviceCalendarTask(event))
        .then(() => {
          IOToast.success(I18n.t("messages.cta.reminderRemoveSuccess"));
          handleRemoveEventFromCalendar({
            messageId,
            eventId: calendarEvent.eventId
          });
        })
        .catch(() =>
          IOToast.error(I18n.t("messages.cta.reminderRemoveFailure"))
        );
      return;
    }
    IOToast.error(I18n.t("messages.cta.reminderRemoveFailure"));
  };

  return {
    preferredCalendar,
    setPreferredCalendar,
    addEventToCalendar,
    removeEventFromCalendar
  };
};
