import { IOToast } from "@io-app/design-system";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Alert } from "react-native";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { addCalendarEvent } from "../../../store/actions/calendarEvents";
import {
  convertLocalCalendarName,
  saveEventToDeviceCalendarTask,
  searchEventInCalendar
} from "../../../utils/calendar";
import { addCalendarEventRequest } from "../store/actions";

type ExistingEventChoice = "add" | "cancel" | "keep";

const askExistingEventChoice = () =>
  new Promise<ExistingEventChoice>(resolve =>
    Alert.alert(
      I18n.t("messages.cta.reminderAlertTitle"),
      I18n.t("messages.cta.reminderAlertDescription"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel",
          onPress: () => resolve("cancel")
        },
        {
          text: I18n.t("messages.cta.reminderAlertKeep"),
          style: "default",
          onPress: () => resolve("keep")
        },
        {
          text: I18n.t("messages.cta.reminderAlertAdd"),
          style: "default",
          onPress: () => resolve("add")
        }
      ],
      { cancelable: false }
    )
  );

/**
 * Adds the reminder of a message to a device calendar, asking the user first
 * whether to keep a matching event already in it.
 */
export function* handleAddCalendarEvent(
  action: ActionType<typeof addCalendarEventRequest>
) {
  const { messageId, dueDate, title, calendar } = action.payload;

  const existingEventId = yield* call(
    searchEventInCalendar,
    [calendar.id],
    dueDate,
    title
  );

  if (O.isSome(existingEventId)) {
    const choice = yield* call(askExistingEventChoice);
    if (choice === "cancel") {
      return;
    }
    if (choice === "keep") {
      yield* put(
        addCalendarEvent({ messageId, eventId: existingEventId.value })
      );
      return;
    }
  }

  const result = yield* call(
    saveEventToDeviceCalendarTask(calendar.id, dueDate, title)
  );

  if (E.isLeft(result)) {
    yield* call(IOToast.error, I18n.t("messages.cta.reminderAddFailure"));
    return;
  }

  yield* call(
    IOToast.success,
    I18n.t("messages.cta.reminderAddSuccess", {
      title,
      calendarTitle: convertLocalCalendarName(calendar.title)
    })
  );
  yield* put(addCalendarEvent({ messageId, eventId: result.right }));
}
