import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  setSecurityAdviceAcknowledged,
  setSecurityAdviceReadyToShow
} from "../actions/securityAdviceActions";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { isDevEnv } from "../../../../../utils/environment";

export type SecurityAdviceAcknowledgedState = {
  acknowledged: boolean | undefined;
  readyToShow: boolean | undefined;
};

export const INITIAL_STATE: SecurityAdviceAcknowledgedState = {
  acknowledged: false,
  readyToShow: false
};

const securityAdviceAcknowledgedReducer = (
  state: SecurityAdviceAcknowledgedState = INITIAL_STATE,
  action: Action
): SecurityAdviceAcknowledgedState => {
  switch (action.type) {
    case getType(differentProfileLoggedIn):
      return action.payload?.isNewInstall ? { ...state } : INITIAL_STATE;
    case getType(setSecurityAdviceAcknowledged):
      return {
        ...state,
        acknowledged: action.payload
      };
    case getType(setSecurityAdviceReadyToShow):
      return {
        ...state,
        readyToShow: action.payload
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_SECURITY_SUGGESTIONS_ACKNOWLEDGE_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "securityAdviceAcknowledged",
  storage: AsyncStorage,
  version: CURRENT_REDUX_SECURITY_SUGGESTIONS_ACKNOWLEDGE_STORE_VERSION,
  whitelist: ["acknowledged"]
};

export const securityAdviceAcknowledgedPersistor = persistReducer<
  SecurityAdviceAcknowledgedState,
  Action
>(persistConfig, securityAdviceAcknowledgedReducer);

export const testableSecurityAdviceAcknowledgedReducer = isDevEnv
  ? {
      securityAdviceAcknowledgedReducer
    }
  : undefined;
