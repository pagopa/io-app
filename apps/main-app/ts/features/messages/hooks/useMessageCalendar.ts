import { IOToast } from "@io-app/design-system";
import * as Calendar from "expo-calendar";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import { useCallback } from "react";

import { removeCalendarEvent } from "../../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { CalendarEvent } from "../../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../../store/reducers/persistedPreferences";
import { removeEventFromDeviceCalendarTask } from "../../../utils/calendar";
import { addCalendarEventRequest } from "../store/actions";

export const useMessageCalendar = (messageId: string) => {
  const dispatch = useIODispatch();

  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const handleRemoveEventFromCalendar = useCallback(
    (event: CalendarEvent) =>
      dispatch(removeCalendarEvent({ messageId: event.messageId })),
    [dispatch]
  );

  const setPreferredCalendar = useCallback(
    (calendar: Calendar.Calendar) =>
      dispatch(
        preferredCalendarSaveSuccess({
          preferredCalendar: calendar
        })
      ),
    [dispatch]
  );

  const addEventToCalendar = (
    dueDate: Date,
    eventTitle: string,
    calendar: Calendar.Calendar
  ) => {
    dispatch(
      addCalendarEventRequest({
        messageId,
        dueDate,
        title: eventTitle,
        calendar
      })
    );
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
