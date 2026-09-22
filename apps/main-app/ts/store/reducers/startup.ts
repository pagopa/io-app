/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";

import {
  sessionCorrupted,
  sessionExpired,
  sessionInvalid
} from "../../features/authentication/common/store/actions";
import { startupLoadSuccess, startupTransientError } from "../actions/startup";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export enum StartupStatusEnum {
  AUTHENTICATED = "authenticated",
  INITIAL = "initial",
  NOT_AUTHENTICATED = "notAuthenticated",
  OFFLINE = "offline",
  ONBOARDING = "onboarding"
}

export type StartupState = {
  status: StartupStatusEnum;
  transientError: StartupTransientError;
};

export type StartupTransientError =
  | StartupTransientErrorNotSet
  | StartupTransientErrorOnGetProfile
  | StartupTransientErrorOnGetSession;

type StartupTransientErrorNotSet = {
  getProfileRetries: 0;
  getSessionRetries: 0;
  kind: "NOT_SET";
};

type StartupTransientErrorOnGetProfile = {
  getProfileRetries: number;
  getSessionRetries: number;
  kind: "GET_PROFILE_DOWN";
  showError: boolean;
};

type StartupTransientErrorOnGetSession = {
  getProfileRetries: number;
  getSessionRetries: number;
  kind: "GET_SESSION_DOWN";
  showError: boolean;
};

export const startupTransientErrorInitialState: StartupTransientError = {
  kind: "NOT_SET",
  getProfileRetries: 0,
  getSessionRetries: 0
};

const initialStartupState: StartupState = {
  status: StartupStatusEnum.INITIAL,
  transientError: startupTransientErrorInitialState
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
    isActionOf(sessionExpired, action) ||
    isActionOf(sessionCorrupted, action)
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
