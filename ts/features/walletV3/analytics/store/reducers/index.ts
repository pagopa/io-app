import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { Action } from "../../../../../store/actions/types";
import {
  walletAnalyticsStorePaymentTentative,
  walletAnalyticsResetPaymentTentative
} from "../actions";

export type WalletAnalyticsState = {
  paymentTentativeByRptId: Record<RptId, number>;
};

const INITIAL_STATE: WalletAnalyticsState = {
  paymentTentativeByRptId: {}
};

// eslint-disable-next-line complexity
const reducer = (
  state: WalletAnalyticsState = INITIAL_STATE,
  action: Action
  // eslint-disable-next-line arrow-body-style
): WalletAnalyticsState => {
  switch (action.type) {
    // Payment tentative
    case getType(walletAnalyticsStorePaymentTentative):
      const currentTentative =
        state.paymentTentativeByRptId[action.payload] || 0;

      return {
        ...state,
        paymentTentativeByRptId: {
          ...state.paymentTentativeByRptId,
          [action.payload]: currentTentative + 1
        }
      };
    case getType(walletAnalyticsResetPaymentTentative):
      const { [action.payload]: _, ...tentatives } =
        state.paymentTentativeByRptId;

      return {
        ...state,
        paymentTentativeByRptId: tentatives
      };
  }
  return state;
};

const CURRENT_REDUX_PAYMENT_ANALYTICS_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "wallet_analytics",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_ANALYTICS_STORE_VERSION,
  whitelist: ["paymentTentativeByRptId"]
};

const persistedReducer = persistReducer<WalletAnalyticsState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;
