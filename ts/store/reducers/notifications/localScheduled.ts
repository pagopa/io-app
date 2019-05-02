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
  isToSchedule: boolean;
}>;

export function getInitialState(): LocalScheduledState {
  return {
    isToSchedule: true
  };
}

const reducer = (
  state: LocalScheduledState = getInitialState(),
  action: Action
): LocalScheduledState => {
  switch (action.type) {
    case getType(updateLocalNotificationsScheduled):
      return { ...state, isToSchedule: action.payload };

    case getType(clearLocalNotificationsScheduled):
      return getInitialState();

    default:
      return state;
  }
};

// Selectors
export const notificationsLocalScheduledSelector = (state: GlobalState) => {
  return state.notifications.scheduled;
};

export default reducer;
