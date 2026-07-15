import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import { Action } from "../../../../../store/actions/types";
import { fastLoginOptInPersistor, FastLoginOptInState } from "./optInReducer";
import {
  securityAdviceAcknowledgedPersistor,
  SecurityAdviceAcknowledgedState
} from "./securityAdviceReducer";
import {
  automaticSessionRefreshPersistor,
  AutomaticSessionRefreshState
} from "./sessionRefreshReducer";
import {
  FastLoginTokenRefreshReducer,
  FastLoginTokenRefreshState
} from "./tokenRefreshReducer";

export type FastLoginState = {
  automaticSessionRefresh: AutomaticSessionRefreshState & PersistPartial;
  optIn: FastLoginOptInState & PersistPartial;
  securityAdviceAcknowledged: PersistPartial & SecurityAdviceAcknowledgedState;
  tokenRefreshHandler: FastLoginTokenRefreshState;
};

export const fastLoginReducer = combineReducers<FastLoginState, Action>({
  optIn: fastLoginOptInPersistor,
  automaticSessionRefresh: automaticSessionRefreshPersistor,
  tokenRefreshHandler: FastLoginTokenRefreshReducer,
  securityAdviceAcknowledged: securityAdviceAcknowledgedPersistor
});
