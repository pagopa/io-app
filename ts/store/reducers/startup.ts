/**
 * A reducer for not persisted preferences.
 */
import { isActionOf } from "typesafe-actions";

import { startupLoadSuccess } from "../actions/startup";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type StartupState = {
  loaded: boolean;
};

const initialStartupState: StartupState = {
  loaded: false
};

export default function startupReducer(
  state: StartupState = initialStartupState,
  action: Action
): StartupState {
  if (isActionOf(startupLoadSuccess, action)) {
    return {
      ...state,
      loaded: action.payload
    };
  }

  return state;
}

// Selector
export const isStartupLoaded = (state: GlobalState): boolean =>
  state.startup.loaded;
