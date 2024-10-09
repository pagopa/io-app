import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { updateSystemNotificationsEnabled } from "../actions/environment";
import { GlobalState } from "../../../../store/reducers/types";
import { notificationsInfoScreenConsent } from "../actions/profileNotificationPermissions";
import { applicationInitialized } from "../../../../store/actions/application";

export type EnvironmentState = {
  applicationInitialized: boolean;
  onboardingInstructionsShown: boolean;
  systemNotificationsEnabled: boolean;
};

export const INITIAL_STATE = {
  applicationInitialized: false,
  onboardingInstructionsShown: false,
  systemNotificationsEnabled: false
};

export const environmentReducer = (
  state: EnvironmentState = INITIAL_STATE,
  action: Action
): EnvironmentState => {
  switch (action.type) {
    case getType(applicationInitialized):
      return { ...state, applicationInitialized: true };
    case getType(notificationsInfoScreenConsent):
      return { ...state, onboardingInstructionsShown: true };
    case getType(updateSystemNotificationsEnabled):
      return { ...state, systemNotificationsEnabled: action.payload };
  }
  return state;
};

export const areNotificationPermissionsEnabled = (state: GlobalState) =>
  state.notifications.environment.systemNotificationsEnabled;
