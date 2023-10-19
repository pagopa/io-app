import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  isLoading,
  isUndefined,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bonus/bpd/model/RemoteValue";
import { updatePaymentForMessage } from "../actions";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";

export type MultiplePaymentState = {
  [key: UIMessageId]: SinglePaymentState | undefined;
};

export type SinglePaymentState = {
  [key: string]:
    | RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
    | undefined;
};

export const initialState: MultiplePaymentState = {};

export const paymentsReducer = (
  state: MultiplePaymentState = initialState,
  action: Action
): MultiplePaymentState => {
  switch (action.type) {
    case getType(updatePaymentForMessage.request):
      return {
        ...state,
        [action.payload.messageId]: {
          ...state[action.payload.messageId],
          [action.payload.paymentId]: remoteLoading
        }
      };
    case getType(updatePaymentForMessage.success):
      return {
        ...state,
        [action.payload.messageId]: {
          ...state[action.payload.messageId],
          [action.payload.paymentId]: remoteReady(action.payload.paymentData)
        }
      };
    case getType(updatePaymentForMessage.failure):
      return {
        ...state,
        [action.payload.messageId]: {
          ...state[action.payload.messageId],
          [action.payload.paymentId]: remoteError(action.payload.details)
        }
      };
    case getType(updatePaymentForMessage.cancel):
      return action.payload.reduce<MultiplePaymentState>(
        (previousState, queuedUpdateActionPayload) => ({
          ...previousState,
          [queuedUpdateActionPayload.messageId]: {
            ...previousState[queuedUpdateActionPayload.messageId],
            [queuedUpdateActionPayload.paymentId]: undefined
          }
        }),
        state
      );
  }
  return state;
};

export const shouldUpdatePaymentSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
) =>
  pipe(
    state.features.pn.payments[messageId],
    O.fromNullable,
    O.chainNullableK(multiplePaymentState => multiplePaymentState[paymentId]),
    O.getOrElse<RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>>(
      () => remoteUndefined
    ),
    isUndefined
  );

export const paymentStatusForUISelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
): RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum> =>
  pipe(
    state.features.pn.payments[messageId],
    O.fromNullable,
    O.chainNullableK(multiplePaymentState => multiplePaymentState[paymentId]),
    O.getOrElse<RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>>(
      () => remoteUndefined
    ),
    remoteValue => (isLoading(remoteValue) ? remoteUndefined : remoteValue)
  );
