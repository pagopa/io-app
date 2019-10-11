/**
 * Instabug message reducer
 */
import { getType } from "typesafe-actions";
import { responseInstabugInfoLoaded } from "../../actions/instabug";

import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type InstabugMessageState = Readonly<{
  value: number;
}>;

const INITIAL_STATE: InstabugMessageState = {
  value: 0
};

const reducer = (
  state: InstabugMessageState = INITIAL_STATE,
  action: Action
): InstabugMessageState => {
  if (action.type === getType(responseInstabugInfoLoaded)) {
    return {
      ...state,
      value: action.payload
    };
  } else {
    return state;
  }
};

export default reducer;

// Selector
export const instabugMessageStateSelector = (state: GlobalState) =>
  state.instabug.message;
