import AsyncStorage from "@react-native-async-storage/async-storage";
import { omit } from "lodash";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import { isDevEnv } from "../../../../../../utils/environment";
import { consolidateActiveSessionLoginData } from "../../../../activeSessionLogin/store/actions";
import { SpidLevel } from "../../utils";
import {
  cieIDDisableTourGuide,
  cieIDSetSelectedSecurityLevel,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";

export type CieLoginState = {
  cieIDSelectedSecurityLevel?: SpidLevel;
  isCieIDTourGuideEnabled: boolean;
  useUat: boolean;
};

export const cieLoginInitialState = {
  useUat: false,
  isCieIDTourGuideEnabled: true
};

const cieLoginReducer = (
  state: CieLoginState = cieLoginInitialState,
  action: Action
): CieLoginState => {
  switch (action.type) {
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
    case getType(cieLoginDisableUat):
      return {
        ...state,
        useUat: false
      };
    case getType(cieLoginEnableUat):
      return {
        ...state,
        useUat: true
      };
    case getType(consolidateActiveSessionLoginData):
      return {
        ...state,
        cieIDSelectedSecurityLevel: action.payload.cieIDSelectedSecurityLevel
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_CIE_LOGIN_STORE_VERSION = 1;

const migrations: MigrationManifest = {
  "0": (state: PersistedState) => ({
    ...state,
    isCieIDTourGuideEnabled: true
  }),
  /**
   * @param state The slice state Removes `isCieIDFeatureEnabled` from the
   *   persist rehydration actions
   */
  "1": (state: PersistedState) => omit(state, "isCieIDFeatureEnabled")
};

const persistConfig: PersistConfig = {
  key: "cieLogin",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  version: CURRENT_REDUX_CIE_LOGIN_STORE_VERSION,
  whitelist: ["isCieIDTourGuideEnabled"]
};

export const cieLoginPersistor = persistReducer<CieLoginState, Action>(
  persistConfig,
  cieLoginReducer
);

export const testableCieLoginReducer = isDevEnv
  ? {
      cieLoginReducer,
      migrations
    }
  : undefined;
