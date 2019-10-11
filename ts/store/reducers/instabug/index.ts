/**
 * Instabug reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import instabugMessageReducer, {
  InstabugMessageState
} from "./instabugMessage";

export type InstabugState = {
  message: InstabugMessageState;
};

const reducer = combineReducers<InstabugState, Action>({
  message: instabugMessageReducer
});

export default reducer;
