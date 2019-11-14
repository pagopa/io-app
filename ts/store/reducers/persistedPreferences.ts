/**
 * A reducer for persisted preferences.
 */
import { Calendar } from "react-native-calendar-events";
import { isActionOf } from "typesafe-actions";

import {
  preferenceFingerprintIsEnabledSaveSuccess,
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferredCalendarSaveSuccess,
  serviceAlertDisplayedOnceSuccess,
  updateEmailNotificationPreferences
} from "../actions/persistedPreferences";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PersistedPreferencesState = Readonly<{
  isFingerprintEnabled?: boolean;
  preferredCalendar?: Calendar;
  wasServiceAlertDisplayedOnce?: boolean;
  isPagoPATestEnabled: boolean;
  isExperimentalFeaturesEnabled: boolean;
  emailNotificationPreferences: EmailNotificationPreferences;
}>;

export enum EmailEnum {
  "DISABLE_ALL" = "DISABLE_ALL",
  "ENABLE_ALL" = "ENABLE_ALL",
  "CUSTOM" = "CUSTOM"
}

export type EmailNotificationPreferences = EmailEnum.CUSTOM | EmailEnum.DISABLE_ALL | EmailEnum.ENABLE_ALL;

const initialPreferencesState: PersistedPreferencesState = {
  isFingerprintEnabled: undefined,
  preferredCalendar: undefined,
  wasServiceAlertDisplayedOnce: false,
  isPagoPATestEnabled: false,
  isExperimentalFeaturesEnabled: false,
  emailNotificationPreferences: EmailEnum.DISABLE_ALL
};

export default function preferencesReducer(
  state: PersistedPreferencesState = initialPreferencesState,
  action: Action
): PersistedPreferencesState {
  if (isActionOf(preferenceFingerprintIsEnabledSaveSuccess, action)) {
    return {
      ...state,
      isFingerprintEnabled: action.payload.isFingerprintEnabled
    };
  }
  if (isActionOf(preferredCalendarSaveSuccess, action)) {
    return {
      ...state,
      preferredCalendar: action.payload.preferredCalendar
    };
  }
  if (isActionOf(serviceAlertDisplayedOnceSuccess, action)) {
    return {
      ...state,
      wasServiceAlertDisplayedOnce: action.payload.wasServiceAlertDisplayedOnce
    };
  }
  if (isActionOf(preferencesPagoPaTestEnvironmentSetEnabled, action)) {
    return {
      ...state,
      isPagoPATestEnabled: action.payload.isPagoPATestEnabled
    };
  }

  if (isActionOf(preferencesExperimentalFeaturesSetEnabled, action)) {
    return {
      ...state,
      isExperimentalFeaturesEnabled: action.payload
    };
  }

  if(isActionOf(updateEmailNotificationPreferences, action)) {
    return {
      ...state,
      emailNotificationPreferences: action.payload
    }
  }

  return state;
}

// Selectors
export const isPagoPATestEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isPagoPATestEnabled;

export const wasServiceAlertDisplayedOnceSelector = (state: GlobalState) =>
  state.persistedPreferences.wasServiceAlertDisplayedOnce;

export const emailNotificationPreferencesSelector = (state: GlobalState) => 
  state.persistedPreferences.emailNotificationPreferences
