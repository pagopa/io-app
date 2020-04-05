/**
 * the goal of this reducer is store a fixed amount of payments
 * to allow the user pick one that could be problematic and forward it
 * to the customer care assistance
 *
 * we store 3 info:
 * - "data" coming from: a message, qr code, or manual insertion
 * - "verified_data" coming from the verification of the previous one (see paymentVerifica.request ACTION and related SAGA)
 * - "failure" coming from the failure of a verification (paymentVerifica.failure)
 */

import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { getType } from "typesafe-actions";
import { DetailEnum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Action } from "../../actions/types";
import { paymentVerifica } from "../../actions/wallet/payment";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import _ from "lodash";

type PaymentHistory = {
  data: RptId;
  verified_data?: PaymentRequestsGetResponse;
  failure?: keyof typeof DetailEnum;
};

export type PaymentsHistoryState = ReadonlyArray<PaymentHistory>;
const INITIAL_STATE: ReadonlyArray<PaymentHistory> = [];
const HISTORY_SIZE = 10;

const findPayment = (
  state: PaymentsHistoryState,
  paymentRequest: RptId
): number => state.findIndex(ph => _.isEqual(ph.data, paymentRequest));

const reducer = (
  state: PaymentsHistoryState = INITIAL_STATE,
  action: Action
): PaymentsHistoryState => {
  switch (action.type) {
    case getType(paymentVerifica.request):
      // it already in, remove the previous one

      // tslint:disable-next-line: readonly-array
      const updateState = [...state];
      const prevIndex = findPayment(state, action.payload);
      if (prevIndex !== -1) {
        updateState.splice(prevIndex, 1);
      }
      if (updateState.length >= HISTORY_SIZE) {
        updateState.splice(state.length - 1, 1);
      }
      return [...updateState, { data: { ...action.payload } }];
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
      updateStateFailure.splice(state.length - 1, 1, updateHistoryFailure);
      return updateStateFailure;
  }
  return state;
};

export default reducer;
