import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import {
  cieIDDisableTourGuide,
  cieIDFeatureSetEnabled,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";
import { Action } from "../../../../store/actions/types";

export type CieLoginState = {
  useUat: boolean;
  isCieIDFeatureEnabled: boolean;
  isCieIDTourGuideEnabled: boolean;
};

export const cieLoginInitialState = {
  useUat: false,
  isCieIDFeatureEnabled: false,
  isCieIDTourGuideEnabled: true
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
    case getType(cieIDDisableTourGuide):
      return {
        ...state,
        isCieIDTourGuideEnabled: false
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_CIE_LOGIN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "cieLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_CIE_LOGIN_STORE_VERSION,
  whitelist: ["isCieIDFeatureEnabled", "isCieIDTourGuideEnabled"]
};

export const cieLoginPersistor = persistReducer<CieLoginState, Action>(
  persistConfig,
  cieLoginReducer
);
