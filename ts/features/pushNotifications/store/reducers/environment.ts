import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { updateSystemNotificationsEnabled } from "../actions/environment";
import { GlobalState } from "../../../../store/reducers/types";

export type EnvironmentState = {
  systemNotificationsEnabled: boolean;
};

export const INITIAL_STATE = {
  systemNotificationsEnabled: false
};

export const environmentReducer = (
  state: EnvironmentState = INITIAL_STATE,
  action: Action
): EnvironmentState => {
  switch (action.type) {
    case getType(updateSystemNotificationsEnabled):
      return { ...state, systemNotificationsEnabled: action.payload };
  }
  return state;
};

export const areNotificationPermissionsEnabled = (state: GlobalState) =>
  state.notifications.environment.systemNotificationsEnabled;
