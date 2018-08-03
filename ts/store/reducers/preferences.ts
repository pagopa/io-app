import { PREFERENCES_LANGUAGES_LOAD_SUCCESS } from "../actions/constants";
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
  if (action.type === PREFERENCES_LANGUAGES_LOAD_SUCCESS) {
    return {
      ...state,
      languages: action.payload
    };
  }
  return state;
}
