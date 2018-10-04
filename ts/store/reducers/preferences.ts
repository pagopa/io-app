import { isActionOf } from "typesafe-actions";

import { preferencesLanguagesLoadSuccess } from "../actions/preferences";
import { Action } from "../actions/types";

export type PreferencesState = Readonly<{
  languages: ReadonlyArray<string> | undefined;
}>;

const initialPreferencesState: PreferencesState = {
  languages: undefined
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

  return state;
}
