/**
 * Notification message reducer
 */
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  clearNotificationPendingMessage,
  updateNotificationsPendingMessage
} from "../actions/pendingMessage";

export type PendingMessageState = Readonly<{
  id: string;
  foreground: boolean;
}> | null;

const INITIAL_STATE: PendingMessageState = null;

export const pendingMessageReducer = (
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

// Selector
export const pendingMessageStateSelector = (state: GlobalState) =>
  state.notifications.pendingMessage;
