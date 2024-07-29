import { getType } from "typesafe-actions";
import {
  resetDebugData,
  setDebugData,
  setDebugModeEnabled
} from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
  debugData: Record<string, any>;
}>;

const INITIAL_STATE: DebugState = {
  isDebugModeEnabled: false,
  debugData: {}
};

export function debugReducer(
  state: DebugState = INITIAL_STATE,
  action: Action
): DebugState {
  switch (action.type) {
    case getType(setDebugModeEnabled):
      return {
        ...state,
        isDebugModeEnabled: action.payload,
        debugData: {}
      };

    /**
     * Debug data to be displayed in DebugInfoOverlay
     */
    case getType(setDebugData):
      return {
        ...state,
        debugData: action.payload
      };
    case getType(resetDebugData):
      return {
        ...state,
        debugData: Object.fromEntries(
          Object.entries(state.debugData).filter(
            ([key]) => !action.payload.includes(key)
          )
        )
      };
  }

  return state;
}

// Selector
export const isDebugModeEnabledSelector = (state: GlobalState) =>
  state.debug.isDebugModeEnabled;
export const debugDataSelector = (state: GlobalState) => state.debug.debugData;
