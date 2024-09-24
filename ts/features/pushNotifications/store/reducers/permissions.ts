import { Action } from "../../../../store/actions/types";

export type NotificationsPermissionsState = {
  systemNotificationsEnabled: boolean;
};

export const INITIAL_STATE = {
  systemNotificationsEnabled: false
};

export const permissionsReducer = (
  state: NotificationsPermissionsState = INITIAL_STATE,
  _action: Action
): NotificationsPermissionsState => state;
