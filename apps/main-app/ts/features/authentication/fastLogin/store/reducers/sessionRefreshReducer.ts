import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import { logoutFailure, logoutSuccess } from "../../../common/store/actions";
import { areTwoMinElapsedFromLastActivity } from "../actions/sessionRefreshActions";

export type AutomaticSessionRefreshState = {
  areAlreadyTwoMinAfterLastActivity: boolean;
};

export const automaticSessionRefreshInitialState: AutomaticSessionRefreshState =
  {
    areAlreadyTwoMinAfterLastActivity: false
  };

const AutomaticSessionRefreshReducer = (
  state: AutomaticSessionRefreshState = automaticSessionRefreshInitialState,
  action: Action
): AutomaticSessionRefreshState => {
  switch (action.type) {
    case getType(areTwoMinElapsedFromLastActivity):
      return {
        ...state,
        areAlreadyTwoMinAfterLastActivity: action.payload.hasTwoMinPassed
      };
    case getType(logoutFailure):
    case getType(logoutSuccess):
      return automaticSessionRefreshInitialState;
    default:
      return state;
  }
};

const CURRENT_REDUX_SESSION_REFRESH_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  // we changed the way we compute the installation ID
  "0": (state: PersistedState) =>
    _.omit(
      state,
      "features.loginFeatures.fastLogin.automaticSessionRefresh.enabled"
    )
};

const persistConfig: PersistConfig = {
  key: "sessionRefresh",
  storage: AsyncStorage,
  version: CURRENT_REDUX_SESSION_REFRESH_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: []
};

export const automaticSessionRefreshPersistor = persistReducer<
  AutomaticSessionRefreshState,
  Action
>(persistConfig, AutomaticSessionRefreshReducer);

export const testableAutomaticSessionRefreshReducer = isDevEnv
  ? {
      AutomaticSessionRefreshReducer
    }
  : undefined;
