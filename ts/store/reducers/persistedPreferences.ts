/**
 * A reducer for persisted preferences.
 */
import { Calendar } from "react-native-calendar-events";
import { isActionOf } from "typesafe-actions";

import {
  preferenceFingerprintIsEnabledSaveSuccess,
  preferredCalendarSaveSuccess,
  serviceAlertDisplayedOnceSuccess
} from "../actions/persistedPreferences";
import { Action } from "../actions/types";

export type PersistedPreferencesState = Readonly<{
  isFingerprintEnabled?: boolean;
  preferredCalendar?: Calendar;
  wasServiceAlertDisplayedOnce?: boolean;
}>;

const initialPreferencesState: PersistedPreferencesState = {
  isFingerprintEnabled: undefined,
  preferredCalendar: undefined,
  wasServiceAlertDisplayedOnce: false
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

  return state;
}
