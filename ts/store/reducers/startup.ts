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

type StartupTransientErrorNotSet = {
  kind: "NOT_SET";
  retry: 0;
};

type StartupTransientErrorOnGetSession = {
  kind: "GET_SESSION_DOWN";
  retry: number;
  showError: boolean;
};

type StartupTransientErrorOnGetProfile = {
  kind: "GET_PROFILE_DOWN";
  retry: number;
  showError: boolean;
};

export type StartupTransientError =
  | StartupTransientErrorNotSet
  | StartupTransientErrorOnGetSession
  | StartupTransientErrorOnGetProfile;

export type StartupState = {
  status: StartupStatusEnum;
  transientError: StartupTransientError;
};

const initialStartupState: StartupState = {
  status: StartupStatusEnum.INITIAL,
  transientError: { kind: "NOT_SET", retry: 0 }
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
): StartupTransientError => state.startup.transientError;

export const isTransientErrorNotSetSelector = (state: GlobalState) =>
  state.startup.transientError.kind === "NOT_SET";

export const isTransientErrorOnGetProfileSelector = (state: GlobalState) =>
  state.startup.transientError.kind === "GET_PROFILE_DOWN";

export const isTransientErrorOnGetSessionSelector = (state: GlobalState) =>
  state.startup.transientError.kind === "GET_SESSION_DOWN";
