import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
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
  walletPaymentGetDetails,
  walletPaymentGetTransactionInfo
} from "../../../payment/store/actions/networking";
import { walletPaymentInitState } from "../../../payment/store/actions/orchestration";
import { WalletPaymentFailure } from "../../../payment/types/WalletPaymentFailure";
import { PaymentHistory } from "../../types";
import {
  walletPaymentStoreNewAttempt,
  walletPaymentHistoryStoreOutcome
} from "../actions";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export type WalletPaymentHistoryState = {
  ongoingPayment?: PaymentHistory;
  archive: ReadonlyArray<PaymentHistory>;
};

const INITIAL_STATE: WalletPaymentHistoryState = {
  archive: []
};

export const ARCHIVE_SIZE = 15;

const reducer = (
  state: WalletPaymentHistoryState = INITIAL_STATE,
  action: Action
): WalletPaymentHistoryState => {
  switch (action.type) {
    case getType(walletPaymentInitState):
      return {
        ...state,
        ongoingPayment: {
          startOrigin: action.payload.startOrigin,
          startedAt: new Date(),
          lookupId: getLookUpId()
        }
      };
    case getType(walletPaymentGetDetails.request):
      return {
        ...state,
        ongoingPayment: {
          ...state.ongoingPayment,
          rptId: action.payload,
          attempt: getPaymentAttemptByRptId(state, action.payload)
        }
      };
    case getType(walletPaymentGetDetails.success):
      return {
        ...state,
        ongoingPayment: {
          ...state.ongoingPayment,
          verifiedData: action.payload
        }
      };
    case getType(walletPaymentStoreNewAttempt):
      return updatePaymentHistory(state, {}, true);
    case getType(walletPaymentCreateTransaction.success):
    case getType(walletPaymentGetTransactionInfo.success):
      return updatePaymentHistory(state, {
        transaction: action.payload
      });
    case getType(walletPaymentHistoryStoreOutcome):
      return updatePaymentHistory(state, {
        outcome: action.payload,
        ...(action.payload === "0" ? { success: true } : {})
      });
    case getType(walletPaymentGetDetails.failure):
    case getType(walletPaymentCreateTransaction.failure):
    case getType(walletPaymentGetTransactionInfo.failure):
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

const getPaymentAttemptByRptId = (
  state: WalletPaymentHistoryState,
  rptId: RptId
) =>
  pipe(
    state.archive as Array<PaymentHistory>,
    A.findFirst(h => h.rptId === rptId),
    O.chainNullableK(h => h.attempt),
    O.getOrElse(() => 0)
  );

const appendItemToArchive = (
  archive: ReadonlyArray<PaymentHistory>,
  item: PaymentHistory
): ReadonlyArray<PaymentHistory> =>
  pipe(
    archive,
    // Remove previous entry if already exists
    a => a.filter(({ rptId }) => !_.isEqual(rptId, item.rptId)),
    // Keep only the latest ARCHIVE_SIZE - 1 entries
    a => a.slice(-ARCHIVE_SIZE + 1),
    // Add the new entry to the archive
    a => [...a, item]
  );

const updatePaymentHistory = (
  state: WalletPaymentHistoryState,
  data: PaymentHistory,
  newAttempt: boolean = false
): WalletPaymentHistoryState => {
  const currentAttempt = state.ongoingPayment?.attempt || 0;
  const updatedOngoingPaymentHistory: PaymentHistory = {
    ...state.ongoingPayment,
    ...data,
    attempt: newAttempt ? currentAttempt + 1 : currentAttempt
  };

  if (newAttempt) {
    return {
      ongoingPayment: updatedOngoingPaymentHistory,
      archive: appendItemToArchive(state.archive, updatedOngoingPaymentHistory)
    };
  }

  return {
    ongoingPayment: updatedOngoingPaymentHistory,
    archive: [..._.dropRight(state.archive), updatedOngoingPaymentHistory]
  };
};

const CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "paymentHistory",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION,
  whitelist: ["archive"]
};

export const walletPaymentHistoryPersistor = persistReducer<
  WalletPaymentHistoryState,
  Action
>(persistConfig, reducer);

export default walletPaymentHistoryPersistor;
