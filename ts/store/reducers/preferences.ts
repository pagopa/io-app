import { isActionOf } from "typesafe-actions";

import { setPreferenceFingerprintMaybeEnabledSuccess } from "../actions/preferences";
import { preferencesLanguagesLoadSuccess } from "../actions/preferences";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PreferencesState = Readonly<{
  languages: ReadonlyArray<string> | undefined;
  isFingerprintEnabled: boolean;
}>;

export const isFingerprintEnabledSelector = (state: GlobalState): boolean =>
  state.preferences.isFingerprintEnabled; 

// Set Fingerprint usage default to true if available.
// It is set to false otherwise, at the end of onboarding process.
const initialPreferencesState: PreferencesState = {
  languages: undefined,
  isFingerprintEnabled: true
};

export default function preferencesReducer(
  state: PreferencesState = initialPreferencesState,
  action: Action
): PreferencesState {
  if (isActionOf(preferencesLanguagesLoadSuccess, action)) {
    return {
      ...state,
      languages: action.payload
    };
  }
  if (isActionOf(setPreferenceFingerprintMaybeEnabledSuccess, action)) {
    return {
      ...state,
      isFingerprintEnabled: action.payload
    };
  }

  return state;
}
