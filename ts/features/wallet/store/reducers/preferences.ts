import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { walletSetCategoryFilter } from "../actions/preferences";
import { WalletCardCategoryFilter } from "../../types";

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

const CURRENT_REDUX_WALLET_PREFERENCES_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "walletPreferences",
  storage: AsyncStorage,
  version: CURRENT_REDUX_WALLET_PREFERENCES_STORE_VERSION
};

export const walletReducerPersistor = persistReducer<
  WalletPreferencesState,
  Action
>(persistConfig, reducer);

export default walletReducerPersistor;
