import { PersistPartial } from "redux-persist";
import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { FastLoginOptInState, fastLoginOptInPersistor } from "./optInReducer";
import {
  FastLoginTokenRefreshReducer,
  FastLoginTokenRefreshState
} from "./tokenRefreshReducer";
import {
  SecurityAdviceAcknowledgedState,
  securityAdviceAcknowledgedPersistor
} from "./securityAdviceReducer";
import {
  fastLoginSessionRefreshPersistor,
  FastLoginSessionRefreshState
} from "./sessionRefreshReducer";

export type FastLoginState = {
  optIn: FastLoginOptInState & PersistPartial;
  sessionRefresh: FastLoginSessionRefreshState & PersistPartial;
  tokenRefreshHandler: FastLoginTokenRefreshState;
  securityAdviceAcknowledged: SecurityAdviceAcknowledgedState & PersistPartial;
};

export const fastLoginReducer = combineReducers<FastLoginState, Action>({
  optIn: fastLoginOptInPersistor,
  sessionRefresh: fastLoginSessionRefreshPersistor,
  tokenRefreshHandler: FastLoginTokenRefreshReducer,
  securityAdviceAcknowledged: securityAdviceAcknowledgedPersistor
});
