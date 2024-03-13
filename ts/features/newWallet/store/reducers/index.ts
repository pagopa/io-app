import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { walletSetPaymentsRedirectBannerVisible } from "../actions/preferences";

export type WalletState = {
  shouldShowPaymentsRedirectBanner: boolean;
};

const INITIAL_STATE: WalletState = {
  shouldShowPaymentsRedirectBanner: true
};

const reducer = (
  state: WalletState = INITIAL_STATE,
  action: Action
): WalletState => {
  switch (action.type) {
    case getType(walletSetPaymentsRedirectBannerVisible):
      return {
        ...state,
        shouldShowPaymentsRedirectBanner: action.payload
      };
  }
  return state;
};

const CURRENT_REDUX_WALLET_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "wallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_WALLET_STORE_VERSION,
  whitelist: ["shouldShowPaymentsRedirectBanner"]
};

export const walletReducerPersistor = persistReducer<WalletState, Action>(
  persistConfig,
  reducer
);

export default walletReducerPersistor;
