import { getType } from "typesafe-actions";
import { setDebugModeEnabled } from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
}>;

const INITIAL_STATE: DebugState = {
  isDebugModeEnabled: false
};

export function debugReducer(
  state: DebugState = INITIAL_STATE,
  action: Action
): DebugState {
  switch (action.type) {
    case getType(setDebugModeEnabled):
      return {
        ...state,
        isDebugModeEnabled: action.payload
      };
  }

  return state;
}

// Selector
export const isDebugModeEnabledSelector = (state: GlobalState) =>
  state.debug.isDebugModeEnabled;
