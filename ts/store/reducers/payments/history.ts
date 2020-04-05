/**
 * the goal of this reducer is store a fixed amount of payments (requested, done or failed)
 * to allow the user to pick one that could be problematic and forward it
 * to the customer care assistance
 *
 * to accomplish this scope we store:
 * - started_at the time in ISO format when the payment started
 * - "data" coming from: a message, qr code, or manual insertion
 * - "verified_data" coming from the verification of the previous one (see paymentVerifica.request ACTION and related SAGA)
 * - "failure" coming from the failure of a verification (paymentVerifica.failure)
 */

import { RptId } from "italia-pagopa-commons/lib/pagopa";
import _ from "lodash";
import { getType } from "typesafe-actions";
import { DetailEnum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import { paymentVerifica } from "../../actions/wallet/payment";
import { GlobalState } from "../types";

export type PaymentHistory = {
  started_at: string;
  data: RptId;
  verified_data?: PaymentRequestsGetResponse;
  failure?: keyof typeof DetailEnum;
};

export type PaymentsHistoryState = ReadonlyArray<PaymentHistory>;
const INITIAL_STATE: ReadonlyArray<PaymentHistory> = [];
export const HISTORY_SIZE = 10;

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
      // tslint:disable-next-line: readonly-array
      const updateStateSuccess = [...state];
      // replace the old vale with the new one
      updateStateSuccess.splice(state.length - 1, 1, updateHistorySuccess);
      return updateStateSuccess;
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
      // tslint:disable-next-line: readonly-array
      const updateStateFailure = [...state];
      // replace the old value with the new one
      updateStateFailure.splice(state.length - 1, 1, updateHistoryFailure);
      return updateStateFailure;
    case getType(clearCache): {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const paymentsHistorySelector = (state: GlobalState) =>
  state.payments.history;

export default reducer;
