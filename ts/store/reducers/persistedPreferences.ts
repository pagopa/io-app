import { isActionOf } from "typesafe-actions";

import { preferenceFingerprintIsEnabledSave } from "../actions/persistedPreferences";
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
  if (isActionOf(preferenceFingerprintIsEnabledSave, action)) {
    return {
      ...state,
      isFingerprintEnabled: action.payload
    };
  }

  return state;
}
