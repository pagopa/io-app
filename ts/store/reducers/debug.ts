import { getType } from "typesafe-actions";

import { setDebugModeEnabled } from "../actions/debug";
import { Action } from "../actions/types";

export type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
}>;

const initialDebugState: DebugState = {
  isDebugModeEnabled: false
};

export function debugReducer(
  state: DebugState = initialDebugState,
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
