import _ from "lodash";
import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { clearCache } from "../../../../store/actions/profile";
import { Action } from "../../../../store/actions/types";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetDetails
} from "../../payment/store/actions/networking";
import { walletPaymentInitState } from "../../payment/store/actions/orchestration";
import { PaymentHistory } from "../types";
import { getLookUpId } from "../../../../utils/pmLookUpId";

export type WalletPaymentHistoryState = {
  currentPaymentHistory?: Partial<PaymentHistory>;
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
        ...INITIAL_STATE,
        // We store the start origin in a temporary variable to save it in the history
        // when the payment flow starts (after the verifica step)
        currentPaymentHistory: {
          startOrigin: action.payload.startOrigin
        }
      };
    case getType(walletPaymentGetDetails.request):
      return {
        ...state,
        currentPaymentHistory: {
          ...state,
          rptId: action.payload
        }
      };
    case getType(walletPaymentGetAllMethods.request):
      // if already in, remove the previous one
      const updatedHistory = [...state.history].filter(
        ph => !_.isEqual(ph.rptId, state.currentPaymentHistory?.rptId)
      );

      // if size exceeded, remove the ones exceeding (here we consider the one we will add in it)
      if (updatedHistory.length + 1 >= HISTORY_SIZE) {
        // eslint-disable-next-line functional/immutable-data
        updatedHistory.splice(
          HISTORY_SIZE - 1,
          updatedHistory.length + 1 - HISTORY_SIZE
        );
      }

      return {
        history: [
          ...updatedHistory,
          {
            ...state.currentPaymentHistory,
            startedAt: new Date(),
            lookupId: getLookUpId()
          }
        ]
      };
    case getType(differentProfileLoggedIn):
    case getType(clearCache):
      return INITIAL_STATE;
  }
  return state;
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
