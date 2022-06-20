/**
 * the goal of this reducer is store a fixed amount of payments (requested, done or failed)
 * to allow the user to pick one that could be problematic and forward it
 * to the customer care assistance
 *
 * to accomplish this scope we store:
 * - started_at the time in ISO format when the payment started
 * - "data" coming from: a message, qr code, or manual insertion
 * - "verifiedData" coming from the verification of the previous one (see paymentVerifica.request ACTION and related SAGA)
 * - "paymentId" coming from payment activation
 * - "transaction" coming from payment manager when we ask for info about latest transaction
 * - "failure" coming from the failure of a verification (paymentVerifica.failure)
 */
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { getType } from "typesafe-actions";

import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Transaction } from "../../../types/pagopa";
import { getLookUpId } from "../../../utils/pmLookUpId";
import { differentProfileLoggedIn } from "../../actions/crossSessions";
import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import { paymentOutcomeCode } from "../../actions/wallet/outcomeCode";
import {
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentRedirectionUrls,
  PaymentStartOrigin,
  paymentVerifica,
  paymentWebViewEnd,
  PaymentWebViewEndReason
} from "../../actions/wallet/payment";
import { fetchTransactionSuccess } from "../../actions/wallet/transactions";
import { GlobalState } from "../types";

export type PaymentHistory = {
  started_at: string;
  data: RptId;
  paymentId?: string;
  // TODO Transaction is not available, add it when PM makes it available again
  // see https://www.pivotaltracker.com/story/show/177067134
  transaction?: Transaction;
  verifiedData?: PaymentRequestsGetResponse;
  failure?: keyof typeof Detail_v2Enum;
  outcomeCode?: string;
  success?: true;
  payNavigationUrls?: ReadonlyArray<string>;
  webViewCloseReason?: PaymentWebViewEndReason;
  lookupId?: string;
  // where the payment started (message, manual insertion, qrcode scan)
  startOrigin: PaymentStartOrigin;
};

export type PaymentsHistoryState = ReadonlyArray<PaymentHistory>;
const INITIAL_STATE: ReadonlyArray<PaymentHistory> = [];
export const HISTORY_SIZE = 15;

// replace the last element of the state with the given one
// if the state is empty does nothing
const replaceLastItem = (
  state: PaymentsHistoryState,
  newItem: PaymentHistory
): PaymentsHistoryState => {
  // it shouldn't never happen since an update actions should come after a create action
  if (state.length === 0) {
    return state;
  }
  return state.slice(0, state.length - 1).concat([newItem]);
};

const reducer = (
  state: PaymentsHistoryState = INITIAL_STATE,
  action: Action
): PaymentsHistoryState => {
  switch (action.type) {
    case getType(paymentVerifica.request):
      // if already in, remove the previous one
      const updateState = [...state].filter(
        ph => !_.isEqual(ph.data, action.payload.rptId)
      );
      // if size exceeded, remove the ones exceeding (here we consider the one we will add in it)
      if (updateState.length + 1 >= HISTORY_SIZE) {
        // eslint-disable-next-line functional/immutable-data
        updateState.splice(
          HISTORY_SIZE - 1,
          updateState.length + 1 - HISTORY_SIZE
        );
      }
      return [
        ...updateState,
        {
          data: { ...action.payload.rptId },
          started_at: new Date().toISOString(),
          lookupId: getLookUpId(),
          startOrigin: action.payload.startOrigin
        }
      ];
    case getType(paymentIdPolling.success):
      const paymentWithPaymentId: PaymentHistory = {
        ...state[state.length - 1],
        paymentId: action.payload
      };
      return replaceLastItem(state, paymentWithPaymentId);
    case getType(fetchTransactionSuccess):
      const paymentWithTransaction: PaymentHistory = {
        ...state[state.length - 1],
        transaction: { ...action.payload }
      };
      return replaceLastItem(state, paymentWithTransaction);
    case getType(paymentVerifica.success):
      const successPayload = action.payload;
      const updateHistorySuccess: PaymentHistory = {
        ...state[state.length - 1],
        verifiedData: successPayload
      };
      return replaceLastItem(state, updateHistorySuccess);
    case getType(paymentVerifica.failure):
      const failurePayload = action.payload;
      const updateHistoryFailure: PaymentHistory = {
        ...state[state.length - 1],
        failure: failurePayload
      };
      return replaceLastItem(state, updateHistoryFailure);
    case getType(paymentCompletedSuccess):
      const updateSuccess: PaymentHistory = {
        ...state[state.length - 1],
        success: true
      };
      return replaceLastItem(state, updateSuccess);
    case getType(paymentOutcomeCode):
      const updateOutcome: PaymentHistory = {
        ...state[state.length - 1],
        outcomeCode: O.getOrElse(() => "n/a")(action.payload.outcome)
      };
      return replaceLastItem(state, updateOutcome);
    case getType(paymentRedirectionUrls):
      const navigationUrls: PaymentHistory = {
        ...state[state.length - 1],
        payNavigationUrls: action.payload
      };
      return replaceLastItem(state, navigationUrls);
    case getType(paymentWebViewEnd):
      return replaceLastItem(state, {
        ...state[state.length - 1],
        webViewCloseReason: action.payload.reason
      });
    case getType(differentProfileLoggedIn):
    case getType(clearCache): {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const paymentsHistorySelector = (state: GlobalState) =>
  state.payments.history;

export default reducer;
