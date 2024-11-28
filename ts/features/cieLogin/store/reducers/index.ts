import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { merge } from "lodash";
import {
  cieIDDisableTourGuide,
  cieIDFeatureSetEnabled,
  cieIDSetSelectedSecurityLevel,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";
import { Action } from "../../../../store/actions/types";
import { isDevEnv } from "../../../../utils/environment";
import { SpidLevel } from "../../utils";

export type CieLoginState = {
  useUat: boolean;
  isCieIDFeatureEnabled: boolean;
  isCieIDTourGuideEnabled: boolean;
  cieIDSelectedSecurityLevel?: SpidLevel;
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
    case getType(cieIDSetSelectedSecurityLevel):
      return {
        ...state,
        cieIDSelectedSecurityLevel: action.payload
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_CIE_LOGIN_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  "0": (state: PersistedState) =>
    merge(state, "features.loginFeatures.cieLogin.isCieIDTourGuideEnabled")
};

const persistConfig: PersistConfig = {
  key: "cieLogin",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  version: CURRENT_REDUX_CIE_LOGIN_STORE_VERSION,
  whitelist: ["isCieIDFeatureEnabled", "isCieIDTourGuideEnabled"]
};

export const cieLoginPersistor = persistReducer<CieLoginState, Action>(
  persistConfig,
  cieLoginReducer
);
