import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { UIMessageDetails, UIMessageId } from "../../types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  foldK,
  isLoading,
  isUndefined,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../common/model/RemoteValue";
import {
  addUserSelectedPaymentRptId,
  reloadAllMessages,
  updatePaymentForMessage
} from "../actions";
import { Detail_v2Enum } from "../../../../../definitions/payments/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../definitions/payments/PaymentRequestsGetResponse";
import { isProfileEmailValidatedSelector } from "../../../settings/common/store/selectors";
import { isPagoPaSupportedSelector } from "../../../../common/versionInfo/store/reducers/versionInfo";
import {
  duplicateSetAndAdd,
  duplicateSetAndRemove,
  getRptIdStringFromPaymentData
} from "../../utils";
import { messagePaymentDataSelector } from "./detailsById";

export type MultiplePaymentState = {
  [key: UIMessageId]: SinglePaymentState | undefined;
  userSelectedPayments: Set<string>;
};

export type SinglePaymentState = {
  [key: string]:
    | RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
    | undefined;
};

export const initialState: MultiplePaymentState = {
  userSelectedPayments: new Set<string>()
};

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
        },
        userSelectedPayments: duplicateSetAndRemove(
          state.userSelectedPayments,
          action.payload.paymentId
        )
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
    case getType(addUserSelectedPaymentRptId):
      return {
        ...state,
        userSelectedPayments: duplicateSetAndAdd(
          state.userSelectedPayments,
          action.payload.paymentId
        )
      };
    case getType(reloadAllMessages.request):
      return initialState;
  }
  return state;
};

const paymentStateSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
) =>
  pipe(
    state.entities.messages.payments[messageId],
    O.fromNullable,
    O.chainNullableK(multiplePaymentState => multiplePaymentState[paymentId]),
    O.getOrElse<RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>>(
      () => remoteUndefined
    )
  );

export const shouldUpdatePaymentSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
) => pipe(paymentStateSelector(state, messageId, paymentId), isUndefined);

export const paymentStatusForUISelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
): RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum> =>
  pipe(paymentStateSelector(state, messageId, paymentId), remoteValue =>
    isLoading(remoteValue) ? remoteUndefined : remoteValue
  );

export const isUserSelectedPaymentSelector = (
  state: GlobalState,
  rptId: string
) => state.entities.messages.payments.userSelectedPayments.has(rptId);

export const userSelectedPaymentRptIdSelector = (
  state: GlobalState,
  messageOrUndefined: UIMessageDetails | undefined
) =>
  pipe(
    messageOrUndefined,
    O.fromNullable,
    O.chainNullableK(message => message.paymentData),
    O.map(getRptIdStringFromPaymentData),
    O.filter(rptId => isUserSelectedPaymentSelector(state, rptId)),
    O.toUndefined
  );

export const canNavigateToPaymentFromMessageSelector = (state: GlobalState) =>
  pipe(
    state,
    isProfileEmailValidatedSelector,
    B.fold(
      () => false,
      () => pipe(state, isPagoPaSupportedSelector)
    )
  );

export const paymentsButtonStateSelector = (
  state: GlobalState,
  messageId: UIMessageId
) =>
  pipe(
    messagePaymentDataSelector(state, messageId),
    O.fromNullable,
    O.map(getRptIdStringFromPaymentData),
    O.map(paymentId => paymentStateSelector(state, messageId, paymentId)),
    O.map(paymentStatus =>
      pipe(
        paymentStatus,
        foldK(
          () => "loading" as const,
          () => "loading" as const,
          _ => "enabled" as const,
          _ => "hidden" as const
        )
      )
    ),
    O.getOrElseW(() => "hidden" as const)
  );

export const isPaymentsButtonVisibleSelector = (
  state: GlobalState,
  messageId: UIMessageId
) =>
  pipe(
    paymentsButtonStateSelector(state, messageId),
    status => status !== "hidden"
  );
