/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";
import { sessionExpired, sessionInvalid } from "../actions/authentication";

import { startupLoadSuccess, StartupStatus } from "../actions/startup";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type StartupState = {
  status: StartupStatus;
};

const initialStartupState: StartupState = {
  status: "initial"
};

export default function startupReducer(
  state: StartupState = initialStartupState,
  action: Action
): StartupState {
  if (isActionOf(startupLoadSuccess, action)) {
    return {
      ...state,
      status: action.payload
    };
  }
  if (
    isActionOf(sessionInvalid, action) ||
    isActionOf(sessionExpired, action)
  ) {
    return {
      ...state,
      status: "notAuthenticated"
    };
  }
  return state;
}

// Selector
export const isStartupLoaded = (state: GlobalState): StartupStatus =>
  state.startup.status;
