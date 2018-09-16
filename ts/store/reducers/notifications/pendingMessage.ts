import {
  NOTIFICATIONS_PENDING_MESSAGE_CLEAR,
  NOTIFICATIONS_PENDING_MESSAGE_UPDATE
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

/**
 * Notification message reducer
 */

export type PendingMessageState = Readonly<{
  id: string;
  foreground: boolean;
}> | null;

export const INITIAL_STATE: PendingMessageState = null;

const reducer = (
  state: PendingMessageState = INITIAL_STATE,
  action: Action
): PendingMessageState => {
  switch (action.type) {
    case NOTIFICATIONS_PENDING_MESSAGE_UPDATE:
      return action.payload;

    case NOTIFICATIONS_PENDING_MESSAGE_CLEAR:
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;

// Selector
export const pendingMessageStateSelector = (state: GlobalState) =>
  state.notifications.pendingMessage;
