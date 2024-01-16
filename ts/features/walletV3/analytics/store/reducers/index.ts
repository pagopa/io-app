import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { Action } from "../../../../../store/actions/types";
import {
  walletAnalyticsStorePaymentAttempt,
  walletAnalyticsResetPaymentAttempt
} from "../actions";

export type WalletAnalyticsState = {
  paymentAttemptsByRptId: Record<RptId, number>;
};

const INITIAL_STATE: WalletAnalyticsState = {
  paymentAttemptsByRptId: {}
};

// eslint-disable-next-line complexity
const reducer = (
  state: WalletAnalyticsState = INITIAL_STATE,
  action: Action
  // eslint-disable-next-line arrow-body-style
): WalletAnalyticsState => {
  switch (action.type) {
    // Payment tentative
    case getType(walletAnalyticsStorePaymentAttempt):
      const currentAttempts = state.paymentAttemptsByRptId[action.payload] || 0;

      return {
        ...state,
        paymentAttemptsByRptId: {
          ...state.paymentAttemptsByRptId,
          [action.payload]: currentAttempts + 1
        }
      };
    case getType(walletAnalyticsResetPaymentAttempt):
      const { [action.payload]: _, ...attempts } = state.paymentAttemptsByRptId;

      return {
        ...state,
        paymentAttemptsByRptId: attempts
      };
  }
  return state;
};

const CURRENT_REDUX_PAYMENT_ANALYTICS_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "wallet_analytics",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_ANALYTICS_STORE_VERSION,
  whitelist: ["paymentAttemptsByRptId"]
};

const persistedReducer = persistReducer<WalletAnalyticsState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;
