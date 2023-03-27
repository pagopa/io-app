/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";
import { sessionExpired, sessionInvalid } from "../actions/authentication";

import { startupLoadSuccess } from "../actions/startup";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export enum StartupStatusEnum {
  INITIAL = "initial",
  ONBOARDING = "onboarding",
  NOT_AUTHENTICATED = "notAuthenticated",
  AUTHENTICATED = "authenticated"
}

export type StartupState = {
  status: StartupStatusEnum;
};

const initialStartupState: StartupState = {
  status: StartupStatusEnum.INITIAL
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
  return state;
}

// Selector
export const isStartupLoaded = (state: GlobalState): StartupStatusEnum =>
  state.startup.status;
