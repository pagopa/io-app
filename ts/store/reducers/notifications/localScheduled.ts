/**
 * Local scheduled notifications reducer
 */

import { getType } from "typesafe-actions";

import {
  clearLocalNotificationsScheduled,
  updateLocalNotificationsScheduled
} from "../../actions/notifications";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type LocalScheduledState = Readonly<{
  isScheduled: boolean;
}>;

export function getInitialState(): LocalScheduledState {
  return {
    isScheduled: false
  };
}

const reducer = (
  state: LocalScheduledState = getInitialState(),
  action: Action
): LocalScheduledState => {
  switch (action.type) {
    case getType(updateLocalNotificationsScheduled):
      return { ...state, isScheduled: action.payload };

    case getType(clearLocalNotificationsScheduled):
      return getInitialState();

    default:
      return state;
  }
};

// Selectors
export const isLocalNotificationsScheduledSelector = (state: GlobalState) => {
  return state.notifications.scheduled.isScheduled;
};

export default reducer;
