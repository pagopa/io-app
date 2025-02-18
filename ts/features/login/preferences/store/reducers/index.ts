import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { closeSessionExpirationBanner } from "../actions";

export type LoginPreferencesState = {
  showSessionExpirationBanner: boolean;
};

const LOGIN_PREFERENCES_INITIAL_STATE: LoginPreferencesState = {
  showSessionExpirationBanner: true
};

// TODO: Probably this value should be persisted
export const loginPreferencesReducer = (
  state: LoginPreferencesState = LOGIN_PREFERENCES_INITIAL_STATE,
  action: Action
): LoginPreferencesState => {
  switch (action.type) {
    case getType(closeSessionExpirationBanner):
      return {
        ...state,
        showSessionExpirationBanner: false
      };
    default:
      return state;
  }
};
