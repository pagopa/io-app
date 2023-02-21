/**
 * A reducer for persisted preferences.
 */
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Calendar } from "react-native-calendar-events";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { Locales } from "../../../locales/locales";
import { setMixpanelEnabled } from "../actions/mixpanel";
import {
  continueWithRootOrJailbreak,
  customEmailChannelSetEnabled,
  preferenceFingerprintIsEnabledSaveSuccess,
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled,
  preferredCalendarRemoveSuccess,
  preferredCalendarSaveSuccess,
  preferredLanguageSaveSuccess,
  serviceAlertDisplayedOnceSuccess,
  preferencesPnTestEnvironmentSetEnabled,
  preferencesIdPayTestSetEnabled
} from "../actions/persistedPreferences";
import { Action } from "../actions/types";
import { differentProfileLoggedIn } from "../actions/crossSessions";
import { GlobalState } from "./types";

export type PersistedPreferencesState = Readonly<{
  isFingerprintEnabled?: boolean;
  preferredCalendar?: Calendar;
  preferredLanguage?: Locales;
  wasServiceAlertDisplayedOnce?: boolean;
  isPagoPATestEnabled: boolean;
  isExperimentalFeaturesEnabled: boolean;
  // TODO: create transformer for Option objects and use Option instead of pot
  //       https://www.pivotaltracker.com/story/show/170998374
  isCustomEmailChannelEnabled: pot.Pot<boolean, undefined>;
  continueWithRootOrJailbreak?: boolean;
  isMixpanelEnabled: boolean | null;
  isPnTestEnabled: boolean;
  isIdPayTestEnabled: boolean;
}>;

export const initialPreferencesState: PersistedPreferencesState = {
  isFingerprintEnabled: undefined,
  preferredCalendar: undefined,
  preferredLanguage: undefined,
  wasServiceAlertDisplayedOnce: false,
  isPagoPATestEnabled: false,
  isExperimentalFeaturesEnabled: false,
  isCustomEmailChannelEnabled: pot.none,
  continueWithRootOrJailbreak: false,
  isMixpanelEnabled: null,
  isPnTestEnabled: false,
  isIdPayTestEnabled: false
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
  if (isActionOf(preferredCalendarRemoveSuccess, action)) {
    return {
      ...state,
      preferredCalendar: initialPreferencesState.preferredCalendar
    };
  }
  if (isActionOf(preferredLanguageSaveSuccess, action)) {
    return {
      ...state,
      preferredLanguage: action.payload.preferredLanguage
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

  if (isActionOf(customEmailChannelSetEnabled, action)) {
    return {
      ...state,
      isCustomEmailChannelEnabled: pot.some(action.payload)
    };
  }

  if (isActionOf(continueWithRootOrJailbreak, action)) {
    return {
      ...state,
      continueWithRootOrJailbreak: action.payload
    };
  }

  if (isActionOf(setMixpanelEnabled, action)) {
    return {
      ...state,
      isMixpanelEnabled: action.payload
    };
  }

  if (isActionOf(preferencesPnTestEnvironmentSetEnabled, action)) {
    return {
      ...state,
      isPnTestEnabled: action.payload.isPnTestEnabled
    };
  }

  // when the current user is different from the previous logged one
  // reset the mixpanel opt-in preference
  if (isActionOf(differentProfileLoggedIn, action)) {
    return {
      ...state,
      isMixpanelEnabled: null
    };
  }

  if (isActionOf(preferencesIdPayTestSetEnabled, action)) {
    return {
      ...state,
      isIdPayTestEnabled: action.payload.isIdPayTestEnabled
    };
  }

  return state;
}

// Selectors
export const isPagoPATestEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isPagoPATestEnabled;

export const wasServiceAlertDisplayedOnceSelector = (state: GlobalState) =>
  state.persistedPreferences.wasServiceAlertDisplayedOnce;

export const isCustomEmailChannelEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isCustomEmailChannelEnabled;

export const preferredCalendarSelector = (state: GlobalState) =>
  state.persistedPreferences.preferredCalendar;

export const isFingerprintEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isFingerprintEnabled;

export const persistedPreferencesSelector = (state: GlobalState) =>
  state.persistedPreferences;

export const continueWithRootOrJailbreakSelector = (state: GlobalState) =>
  state.persistedPreferences.continueWithRootOrJailbreak;

export const isMixpanelEnabled = (state: GlobalState): boolean | null =>
  state.persistedPreferences.isMixpanelEnabled;

export const isPnTestEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isPnTestEnabled;

export const isIdPayTestEnabledSelector = (state: GlobalState) =>
  state.persistedPreferences.isIdPayTestEnabled;

// returns the preferred language as an Option from the persisted store
export const preferredLanguageSelector = createSelector<
  GlobalState,
  PersistedPreferencesState,
  O.Option<Locales>
>(persistedPreferencesSelector, pps => O.fromNullable(pps.preferredLanguage));
