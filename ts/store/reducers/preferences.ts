import { isActionOf } from "typesafe-actions";

import { preferenceFingerprintIsEnabledSave } from "../actions/preferences";
import { preferencesLanguagesLoadSuccess } from "../actions/preferences";
import { Action } from "../actions/types";

export type PreferencesState = Readonly<{
  languages: ReadonlyArray<string> | undefined;
  isFingerprintEnabled: boolean | undefined;
}>;

const initialPreferencesState: PreferencesState = {
  languages: undefined,
  isFingerprintEnabled: undefined
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
  if (isActionOf(preferenceFingerprintIsEnabledSave, action)) {
    return {
      ...state,
      isFingerprintEnabled: action.payload
    };
  }

  return state;
}
