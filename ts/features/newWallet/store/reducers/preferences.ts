import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  walletSetCategoryFilter,
  walletSetPaymentsRedirectBannerVisible
} from "../actions/preferences";
import { WalletCardCategory } from "../../types";

export type WalletPreferencesState = {
  shouldShowPaymentsRedirectBanner: boolean;
  categoryFilter?: WalletCardCategory;
};

const INITIAL_STATE: WalletPreferencesState = {
  shouldShowPaymentsRedirectBanner: true
};

const reducer = (
  state: WalletPreferencesState = INITIAL_STATE,
  action: Action
): WalletPreferencesState => {
  switch (action.type) {
    case getType(walletSetPaymentsRedirectBannerVisible):
      return {
        ...state,
        shouldShowPaymentsRedirectBanner: action.payload
      };
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
  version: CURRENT_REDUX_WALLET_PREFERENCES_STORE_VERSION,
  whitelist: ["shouldShowPaymentsRedirectBanner"]
};

export const walletReducerPersistor = persistReducer<
  WalletPreferencesState,
  Action
>(persistConfig, reducer);

export default walletReducerPersistor;
