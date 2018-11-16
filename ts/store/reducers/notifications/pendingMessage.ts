/**
 * Notification message reducer
 */
import { getType } from "typesafe-actions";

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import {
  clearNotificationPendingMessage,
  updateNotificationsPendingMessage
} from "../../actions/notifications";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type PendingMessageState = Readonly<{
  id: NonEmptyString;
  foreground: boolean;
}> | null;

const INITIAL_STATE: PendingMessageState = null;

const reducer = (
  state: PendingMessageState = INITIAL_STATE,
  action: Action
): PendingMessageState => {
  switch (action.type) {
    case getType(updateNotificationsPendingMessage):
      return action.payload;

    case getType(clearNotificationPendingMessage):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;

// Selector
export const pendingMessageStateSelector = (state: GlobalState) =>
  state.notifications.pendingMessage;
