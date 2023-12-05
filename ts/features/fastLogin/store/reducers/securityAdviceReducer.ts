import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { setSecurityAdviceAcknowledged } from "../actions/securityAdviceActions";

export type SecurityAdviceAcknowledgedState = {
  acknowledged: boolean | undefined;
};

export const INITIAL_STATE: SecurityAdviceAcknowledgedState = {
  acknowledged: false
};

const securityAdviceAcknowledgedReducer = (
  state: SecurityAdviceAcknowledgedState = INITIAL_STATE,
  action: Action
): SecurityAdviceAcknowledgedState => {
  switch (action.type) {
    case getType(setSecurityAdviceAcknowledged):
      return {
        ...state,
        acknowledged: action.payload.acknowledged
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
  whitelist: ["enabled"]
};

export const securityAdviceAcknowledgedPersistor = persistReducer<
  SecurityAdviceAcknowledgedState,
  Action
>(persistConfig, securityAdviceAcknowledgedReducer);
