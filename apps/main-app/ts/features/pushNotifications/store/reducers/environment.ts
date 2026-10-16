import { getType } from "typesafe-actions";

import { applicationInitialized } from "../../../../store/actions/application";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration,
  updateSystemNotificationsEnabled
} from "../actions/environment";
import { notificationsInfoScreenConsent } from "../actions/profileNotificationPermissions";

export type EnvironmentState = {
  applicationInitialized: boolean;
  engagementScreenShownThisSession: boolean;
  onboardingInstructionsShown: boolean;
  pushNotificationPermissionsRequestDuration?: number;
  systemNotificationsEnabled: boolean;
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
    case getType(setEngagementScreenShown):
      return {
        ...state,
        engagementScreenShownThisSession: true
      };
    case getType(setPushPermissionsRequestDuration):
      return {
        ...state,
        pushNotificationPermissionsRequestDuration: action.payload
      };
    case getType(updateSystemNotificationsEnabled):
      return { ...state, systemNotificationsEnabled: action.payload };
  }
  return state;
};

export const areNotificationPermissionsEnabledSelector = (state: GlobalState) =>
  state.notifications.environment.systemNotificationsEnabled;
