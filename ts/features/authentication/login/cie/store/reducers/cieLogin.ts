import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { omit } from "lodash";
import {
  cieIDDisableTourGuide,
  cieIDSetSelectedSecurityLevel,
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../actions";
import { Action } from "../../../../../../store/actions/types";
import { isDevEnv } from "../../../../../../utils/environment";
import { SpidLevel } from "../../utils";

export type CieLoginState = {
  useUat: boolean;
  isCieIDTourGuideEnabled: boolean;
  cieIDSelectedSecurityLevel?: SpidLevel;
};

export const cieLoginInitialState = {
  useUat: false,
  isCieIDTourGuideEnabled: true
};

export const cieLoginReducer = (
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

const CURRENT_REDUX_CIE_LOGIN_STORE_VERSION = 1;

export const migrations: MigrationManifest = {
  "0": (state: PersistedState) => ({
    ...state,
    isCieIDTourGuideEnabled: true
  }),
  /**
   * @param state The slice state
   * Removes `isCieIDFeatureEnabled` from the persist rehydration actions
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
