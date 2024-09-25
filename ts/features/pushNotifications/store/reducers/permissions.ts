import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { updateSystemNotificationsEnabled } from "../actions/permissions";
import { GlobalState } from "../../../../store/reducers/types";

export type NotificationsPermissionsState = {
  systemNotificationsEnabled: boolean;
};

export const INITIAL_STATE = {
  systemNotificationsEnabled: false
};

export const permissionsReducer = (
  state: NotificationsPermissionsState = INITIAL_STATE,
  action: Action
): NotificationsPermissionsState => {
  switch (action.type) {
    case getType(updateSystemNotificationsEnabled):
      return { ...state, systemNotificationsEnabled: action.payload };
  }
  return state;
};

export const areNotificationPermissionsEnabled = (state: GlobalState) =>
  state.notifications.permissions.systemNotificationsEnabled;
