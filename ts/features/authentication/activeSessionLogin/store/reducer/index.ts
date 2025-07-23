import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { Action } from "../../../../../store/actions/types";
import {
  activeSessionLoginFailure,
  setActiveSessionLogin,
  setFinishedActiveSessionLogin
} from "../actions";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { isDevEnv } from "../../../../../utils/environment";

export type ActiveSessionLoginState = {
  isActiveSessionLogin?: boolean;
  isActiveSessionLoginFailed?: boolean;
  isUserLoggedIn?: boolean;
};

const initialState: ActiveSessionLoginState = {
  isActiveSessionLogin: false,
  isActiveSessionLoginFailed: false,
  isUserLoggedIn: false
};

const ActiveSessionLoginReducer = (
  state: ActiveSessionLoginState = initialState,
  action: Action
): ActiveSessionLoginState => {
  switch (action.type) {
    case getType(loginSuccess):
      return {
        ...state,
        isActiveSessionLogin: true,
        isActiveSessionLoginFailed: false,
        isUserLoggedIn: true
      };

    case getType(loginFailure):
      return {
        ...state,
        isActiveSessionLogin: true,
        isActiveSessionLoginFailed: true,
        isUserLoggedIn: false
      };

    case getType(activeSessionLoginFailure):
      return {
        ...state,
        isActiveSessionLoginFailed: true
      };

    case getType(setActiveSessionLogin):
      return {
        ...state,
        isActiveSessionLogin: true
      };

    case getType(setFinishedActiveSessionLogin):
      return initialState;

    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  "0": (state: PersistedState) => ({
    ...state,
    isActiveSessionLogin: false
  })
};

const persistConfig: PersistConfig = {
  key: "activeSessionLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: [""] // add persisted partial state
};

export const ActiveSessionLoginPersistor = persistReducer<
  ActiveSessionLoginState,
  Action
>(persistConfig, ActiveSessionLoginReducer);
