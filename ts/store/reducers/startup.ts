/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";
import { sessionExpired, sessionInvalid } from "../actions/authentication";

import { startupLoadSuccess, startupTransientError } from "../actions/startup";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export enum StartupStatusEnum {
  INITIAL = "initial",
  ONBOARDING = "onboarding",
  NOT_AUTHENTICATED = "notAuthenticated",
  AUTHENTICATED = "authenticated"
}

export enum StartupTransientErrorEnum {
  NOT_SET = "NOT_SET",
  GET_SESSION_DOWN = "GET_SESSION_DOWN",
  GET_PROFILE_DOWN = "GET_PROFILE_DOWN"
}

export type StartupState = {
  status: StartupStatusEnum;
  transientError: StartupTransientErrorEnum;
};

const initialStartupState: StartupState = {
  status: StartupStatusEnum.INITIAL,
  transientError: StartupTransientErrorEnum.NOT_SET
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
      status: StartupStatusEnum.NOT_AUTHENTICATED
    };
  }
  if (isActionOf(startupTransientError, action)) {
    return {
      ...state,
      transientError: action.payload
    };
  }
  return state;
}

// Selector
export const isStartupLoaded = (state: GlobalState): StartupStatusEnum =>
  state.startup.status;

export const startupTransientErrorSelector = (
  state: GlobalState
): StartupTransientErrorEnum => state.startup.transientError;
