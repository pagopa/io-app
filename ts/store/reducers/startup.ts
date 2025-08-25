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
  INITIAL = "initial",
  ONBOARDING = "onboarding",
  NOT_AUTHENTICATED = "notAuthenticated",
  AUTHENTICATED = "authenticated",
  OFFLINE = "offline"
}

type StartupTransientErrorNotSet = {
  kind: "NOT_SET";
  getSessionRetries: 0;
  getProfileRetries: 0;
};

type StartupTransientErrorOnGetSession = {
  kind: "GET_SESSION_DOWN";
  getSessionRetries: number;
  getProfileRetries: number;
  showError: boolean;
};

type StartupTransientErrorOnGetProfile = {
  kind: "GET_PROFILE_DOWN";
  getSessionRetries: number;
  getProfileRetries: number;
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
