import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration,
  updateSystemNotificationsEnabled
} from "../actions/environment";
import { GlobalState } from "../../../../store/reducers/types";
import { notificationsInfoScreenConsent } from "../actions/profileNotificationPermissions";
import { applicationInitialized } from "../../../../store/actions/application";

export type EnvironmentState = {
  applicationInitialized: boolean;
  onboardingInstructionsShown: boolean;
  systemNotificationsEnabled: boolean;
  pushNotificationPermissionsRequestDuration?: number;
  engagementScreenShownThisSession: boolean;
};

export const INITIAL_STATE = {
  applicationInitialized: false,
  onboardingInstructionsShown: false,
  systemNotificationsEnabled: false,
  pushNotificationPermissionsRequestDuration: undefined,
  engagementScreenShownThisSession: false
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
    case getType(setPushPermissionsRequestDuration):
      return {
        ...state,
        pushNotificationPermissionsRequestDuration: action.payload
      };
    case getType(setEngagementScreenShown):
      return {
        ...state,
        engagementScreenShownThisSession: true
      };
  }
  return state;
};

export const areNotificationPermissionsEnabledSelector = (state: GlobalState) =>
  state.notifications.environment.systemNotificationsEnabled;
