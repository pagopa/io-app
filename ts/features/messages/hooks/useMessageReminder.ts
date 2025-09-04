import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Calendar } from "react-native-calendar-events";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import {
  isEventInCalendar,
  requestCalendarPermission
} from "../../../utils/calendar";
import { openAppSettings } from "../../../utils/appSettings";
import { useIOSelector } from "../../../store/hooks";
import { calendarEventByMessageIdSelector } from "../../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { useMessageCalendar } from "./useMessageCalendar";

export const useMessageReminder = (
  messageId: string,
  selectCalendar: () => void
) => {
  const [isEventInDeviceCalendar, setIsEventInDeviceCalendar] =
    useState<boolean>(false);

  const calendarEvent = useIOSelector(state =>
    calendarEventByMessageIdSelector(state, messageId)
  );

  const { addEventToCalendar, removeEventFromCalendar } =
    useMessageCalendar(messageId);

  /**
   * Hook that checks if the event is in the device calendar
   */
  useEffect(() => {
    void pipe(
      calendarEvent,
      O.fromNullable,
      TE.fromOption(() => new Error("Event not found")),
      TE.chain(event => isEventInCalendar(event.eventId)),
      TE.map(setIsEventInDeviceCalendar),
      TE.mapLeft(() => setIsEventInDeviceCalendar(false))
    )();
  }, [calendarEvent]);

  const upsertReminder = async (
    dueDate: Date,
    subject: string,
    preferredCalendar: Calendar | undefined
  ) => {
    const permissionGranted = await requestCalendarPermission();

    // Authorized is false (denied, restricted or undetermined)
    // If the user denied permission previously (not in this session)
    // prompt an alert to inform that his calendar permissions could have been turned off
    if (!permissionGranted) {
      Alert.alert(
        I18n.t("messages.cta.calendarPermDenied.title"),
        undefined,
        [
          {
            text: I18n.t("messages.cta.calendarPermDenied.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("messages.cta.calendarPermDenied.ok"),
            style: "default",
            onPress: openAppSettings
          }
        ],
        { cancelable: true }
      );

      return;
    }

    // If the event is in the calendar prompt an alert and ask for confirmation
    if (isEventInDeviceCalendar) {
      Alert.alert(
        I18n.t("messages.cta.reminderRemoveRequest.title"),
        undefined,
        [
          {
            text: I18n.t("messages.cta.reminderRemoveRequest.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("messages.cta.reminderRemoveRequest.ok"),
            style: "destructive",
            onPress: () => removeEventFromCalendar(calendarEvent)
          }
        ],
        { cancelable: false }
      );

      return;
    }

    if (preferredCalendar) {
      const title = I18n.t("messages.cta.reminderTitle", {
        title: subject
      });

      addEventToCalendar(dueDate, title, preferredCalendar);

      return;
    }

    // Navigate to the screen to let the user select a calendar
    selectCalendar();
  };

  return {
    isEventInDeviceCalendar,
    upsertReminder
  };
};
