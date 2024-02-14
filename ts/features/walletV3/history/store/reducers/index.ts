import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { clearCache } from "../../../../../store/actions/profile";
import { Action } from "../../../../../store/actions/types";
import { getLookUpId } from "../../../../../utils/pmLookUpId";
import {
  walletPaymentCreateTransaction,
  walletPaymentGetDetails
} from "../../../payment/store/actions/networking";
import { walletPaymentInitState } from "../../../payment/store/actions/orchestration";
import { WalletPaymentFailure } from "../../../payment/types/WalletPaymentFailure";
import { PaymentHistory } from "../../types";
import { walletPaymentHistoryStoreOutcome } from "../actions";

export type WalletPaymentHistoryState = {
  activePaymentHistory?: PaymentHistory;
  history: ReadonlyArray<PaymentHistory>;
};

const INITIAL_STATE: WalletPaymentHistoryState = {
  history: []
};

export const HISTORY_SIZE = 15;

const reducer = (
  state: WalletPaymentHistoryState = INITIAL_STATE,
  action: Action
): WalletPaymentHistoryState => {
  switch (action.type) {
    case getType(walletPaymentInitState):
      return {
        ...state,
        activePaymentHistory: {
          startOrigin: action.payload.startOrigin,
          startedAt: new Date(),
          lookupId: getLookUpId()
        }
      };
    case getType(walletPaymentGetDetails.request):
      return updatePaymentHistory(state, {
        rptId: action.payload
      });
    case getType(walletPaymentGetDetails.success):
      return updatePaymentHistory(state, {
        verifiedData: action.payload
      });
    case getType(walletPaymentCreateTransaction.success):
      return updatePaymentHistory(state, {
        transaction: action.payload
      });
    case getType(walletPaymentHistoryStoreOutcome):
      return updatePaymentHistory(state, {
        outcome: action.payload
      });
    case getType(walletPaymentGetDetails.failure):
    case getType(walletPaymentCreateTransaction.failure):
      return updatePaymentHistory(state, {
        failure: pipe(
          WalletPaymentFailure.decode(action.payload),
          O.fromEither,
          O.toUndefined
        )
      });
    case getType(differentProfileLoggedIn):
    case getType(clearCache):
      return INITIAL_STATE;
  }
  return state;
};

const appendItemToHistory = (
  history: ReadonlyArray<PaymentHistory>,
  item: PaymentHistory
): ReadonlyArray<PaymentHistory> =>
  pipe(
    history,
    // Remove previous entry if already exists
    h => h.filter(({ rptId }) => !_.isEqual(rptId, item.rptId)),
    // Keep only the latest HISTORY_SIZE - 1 entries
    h => h.slice(-HISTORY_SIZE + 1),
    // Add the new entry to the history
    h => [...h, item]
  );

const updatePaymentHistory = (
  state: WalletPaymentHistoryState,
  data: PaymentHistory
): WalletPaymentHistoryState => {
  const updatedActivePaymentHistory = {
    ...state.activePaymentHistory,
    ...data
  };

  const updatedHistory = appendItemToHistory(
    state.history,
    updatedActivePaymentHistory
  );

  return {
    activePaymentHistory: updatedActivePaymentHistory,
    history: updatedHistory
  };
};

const CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "paymentHistory",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION,
  whitelist: ["history"]
};

export const walletPaymentHistoryPersistor = persistReducer<
  WalletPaymentHistoryState,
  Action
>(persistConfig, reducer);

export default walletPaymentHistoryPersistor;
