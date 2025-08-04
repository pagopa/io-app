import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../actions/securePreferences";
import itwCreateSecureStorage from "../storages/itwSecureStorage";

export type ItwSecurePreferencesState = {
  /**
   * Number of offline accesses that user can perform before being required to
   * return online
   */
  offlineAccessCounter: number;
};

export const itwSecurePreferencesInitialState: ItwSecurePreferencesState = {
  offlineAccessCounter: 0
};

const reducer = (
  state: ItwSecurePreferencesState = itwSecurePreferencesInitialState,
  action: Action
): ItwSecurePreferencesState => {
  switch (action.type) {
    case getType(itwOfflineAccessCounterUp): {
      return {
        ...state,
        offlineAccessCounter: state.offlineAccessCounter + 1
      };
    }

    case getType(itwOfflineAccessCounterReset): {
      return {
        ...state,
        offlineAccessCounter: 0
      };
    }

    default:
      return state;
  }
};

const CURRENT_REDUX_ITW_SECURE_PREFERENCES_STORE_VERSION = -1;

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletSecurePreferences",
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_SECURE_PREFERENCES_STORE_VERSION
};

const persistedReducer = persistReducer(itwCredentialsPersistConfig, reducer);

export default persistedReducer;
