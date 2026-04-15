import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import {
  MigrationManifest,
  PersistConfig,
  PersistedState,
  createMigrate,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { isDevEnv } from "../../../../utils/environment";
import { WalletCardCategoryFilter } from "../../types";
import { walletSetCategoryFilter } from "../actions/preferences";

export type WalletPreferencesState = {
  categoryFilter?: WalletCardCategoryFilter;
};

const INITIAL_STATE: WalletPreferencesState = {};

const reducer = (
  state: WalletPreferencesState = INITIAL_STATE,
  action: Action
): WalletPreferencesState => {
  switch (action.type) {
    case getType(walletSetCategoryFilter):
      return {
        ...state,
        categoryFilter: action.payload
      };
  }
  return state;
};

const CURRENT_REDUX_WALLET_PREFERENCES_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  // Removed categoryFilter persistance requirement
  "0": (state: PersistedState): PersistedState =>
    _.set(state, "preferences", {})
};

const persistConfig: PersistConfig = {
  key: "walletPreferences",
  storage: AsyncStorage,
  version: CURRENT_REDUX_WALLET_PREFERENCES_STORE_VERSION,
  blacklist: ["categoryFilter"],
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

export const walletReducerPersistor = persistReducer<
  WalletPreferencesState,
  Action
>(persistConfig, reducer);

export default walletReducerPersistor;
