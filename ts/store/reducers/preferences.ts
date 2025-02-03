/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";

import {
  preferencesLanguagesLoadSuccess,
  setScreenReaderEnabled
} from "../actions/preferences";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PreferencesState = Readonly<{
  languages?: ReadonlyArray<string>;
  screenReaderEnabled: boolean | undefined;
}>;

const initialPreferencesState: PreferencesState = {
  languages: undefined,
  screenReaderEnabled: undefined
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
  if (isActionOf(setScreenReaderEnabled, action)) {
    return {
      ...state,
      screenReaderEnabled: action.payload.screenReaderEnabled
    };
  }

  return state;
}

export const isScreenReaderEnabledSelector = (state: GlobalState): boolean =>
  !!state.preferences.screenReaderEnabled;
