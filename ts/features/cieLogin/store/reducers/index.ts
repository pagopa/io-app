import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import {
  cieIDFeatureSetEnabled,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";
import { Action } from "../../../../store/actions/types";

export type CieLoginState = {
  useUat: boolean;
  isCieIDFeatureEnabled: boolean;
};

export const cieLoginInitialState = {
  useUat: false,
  isCieIDFeatureEnabled: false
};

const cieLoginReducer = (
  state: CieLoginState = cieLoginInitialState,
  action: Action
): CieLoginState => {
  switch (action.type) {
    case getType(cieLoginEnableUat):
      return {
        ...state,
        useUat: true
      };
    case getType(cieLoginDisableUat):
      return {
        ...state,
        useUat: false
      };
    case getType(cieIDFeatureSetEnabled):
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "cieLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  whitelist: ["isCieIDFeatureEnabled"]
};

export const cieLoginPersistor = persistReducer<CieLoginState, Action>(
  persistConfig,
  cieLoginReducer
);
