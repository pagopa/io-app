/**
 * the goal of this reducer is store a fixed amount of payments (requested, done or failed)
 * to allow the user to pick one that could be problematic and forward it
 * to the customer care assistance
 *
 * to accomplish this scope we store:
 * - started_at the time in ISO format when the payment started
 * - "data" coming from: a message, qr code, or manual insertion
 * - "verified_data" coming from the verification of the previous one (see paymentVerifica.request ACTION and related SAGA)
 * - "paymentId" coming from payment activation
 * - "transaction" coming from payment manager when we ask for info about latest transaction
 * - "failure" coming from the failure of a verification (paymentVerifica.failure)
 */
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import _ from "lodash";
import { getType } from "typesafe-actions";
import { DetailEnum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { isSuccessTransaction, Transaction } from "../../../types/pagopa";
import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import {
  paymentIdPolling,
  paymentVerifica
} from "../../actions/wallet/payment";
import { fetchTransactionSuccess } from "../../actions/wallet/transactions";
import { GlobalState } from "../types";

export type PaymentHistory = {
  started_at: string;
  data: RptId;
  paymentId?: string;
  transaction?: Transaction;
  verified_data?: PaymentRequestsGetResponse;
  failure?: keyof typeof DetailEnum;
};

export type PaymentsHistoryState = ReadonlyArray<PaymentHistory>;
const INITIAL_STATE: ReadonlyArray<PaymentHistory> = [];
export const HISTORY_SIZE = 15;

// replace the last element of the state with the given one
const replaceLastItem = (
  state: PaymentsHistoryState,
  newItem: PaymentHistory
): PaymentsHistoryState => {
  // tslint:disable-next-line: readonly-array
  const cloneState = [...state];
  cloneState.splice(state.length - 1, 1, newItem);
  return cloneState;
};

const reducer = (
  state: PaymentsHistoryState = INITIAL_STATE,
  action: Action
): PaymentsHistoryState => {
  switch (action.type) {
    case getType(paymentVerifica.request):
      // if already in, remove the previous one
      const updateState = [...state].filter(
        ph => !_.isEqual(ph.data, action.payload)
      );
      // if size exceeded, remove the ones exceeding (here we consider the one we will add in it)
      if (updateState.length + 1 >= HISTORY_SIZE) {
        updateState.splice(
          HISTORY_SIZE - 1,
          updateState.length + 1 - HISTORY_SIZE
        );
      }
      return [
        ...updateState,
        { data: { ...action.payload }, started_at: new Date().toISOString() }
      ];
    case getType(paymentIdPolling.success):
      // it shouldn't happen since paymentIdPolling comes after request
      if (state.length === 0) {
        return state;
      }
      const paymentWithPaymentId: PaymentHistory = {
        ...state[state.length - 1],
        paymentId: action.payload
      };
      return replaceLastItem(state, paymentWithPaymentId);
    case getType(fetchTransactionSuccess):
      // it shouldn't happen since paymentIdPolling comes after request
      if (state.length === 0) {
        return state;
      }
      const paymentWithTransaction: PaymentHistory = {
        ...state[state.length - 1],
        transaction: { ...action.payload }
      };
      return replaceLastItem(state, paymentWithTransaction);
    case getType(paymentVerifica.success):
      // it shouldn't happen since success comes after request
      if (state.length === 0) {
        return state;
      }
      const successPayload = action.payload;
      const updateHistorySuccess: PaymentHistory = {
        ...state[state.length - 1],
        verified_data: successPayload
      };
      return replaceLastItem(state, updateHistorySuccess);
    case getType(paymentVerifica.failure):
      // it shouldn't happen since failure comes after request
      if (state.length === 0) {
        return state;
      }
      const failurePayload = action.payload;
      const updateHistoryFailure: PaymentHistory = {
        ...state[state.length - 1],
        failure: failurePayload
      };
      return replaceLastItem(state, updateHistoryFailure);
    case getType(clearCache): {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const paymentsHistorySelector = (state: GlobalState) =>
  state.payments.history;

/**
 * return some(true) if payment ends successfully
 * return some(false) if payment ends with a failure
 * return none if payements didn't end (no data to say failure or success)
 * @param payment
 */
export const isPaymentDoneSuccessfully = (
  payment: PaymentHistory
): Option<boolean> => {
  if (payment.failure) {
    return some(false);
  }
  return fromNullable(payment.transaction).map(
    t => t !== undefined && isSuccessTransaction(t)
  );
};

export default reducer;
