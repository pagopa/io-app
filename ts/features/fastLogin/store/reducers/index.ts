import { PersistPartial } from "redux-persist";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { FastLoginOptInState, fastLoginOptInPersistor } from "./optInReducer";
import {
  FastLoginTokenRefreshReducer,
  FastLoginTokenRefreshState
} from "./tokenRefreshReducer";

export type FastLoginState = {
  optIn: FastLoginOptInState & PersistPartial;
  tokenRefreshHandler: FastLoginTokenRefreshState;
};

export const fastLoginReducer = combineReducers<FastLoginState, Action>({
  optIn: fastLoginOptInPersistor,
  tokenRefreshHandler: FastLoginTokenRefreshReducer
});
