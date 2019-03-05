import { isActionOf } from "typesafe-actions";

import { preferenceFingerprintIsEnabledSaveSuccess } from "../actions/persistedPreferences";
import { Action } from "../actions/types";

export type PersistedPreferencesState = Readonly<{
  isFingerprintEnabled: boolean | undefined;
}>;

const initialPreferencesState: PersistedPreferencesState = {
  isFingerprintEnabled: undefined
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

  return state;
}
