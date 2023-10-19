import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  isError,
  isLoading,
  isReady,
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
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { getRptIdStringFromPayment } from "../../utils/rptId";

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

export const paymentsButtonStateSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  payments: ReadonlyArray<NotificationPaymentInfo>,
  maxVisiblePaymentCount: number
) =>
  pipe(
    state.features.pn.payments[messageId],
    O.fromNullable,
    computeUpdatedPaymentCount(payments, maxVisiblePaymentCount),
    buttonStateFromUpdatedPaymentCount(payments, maxVisiblePaymentCount)
  );

const computeUpdatedPaymentCount =
  (
    payments: ReadonlyArray<NotificationPaymentInfo>,
    maxVisiblePaymentCount: number
  ) =>
  (maybePaymentStatuses: O.Option<SinglePaymentState>) =>
    pipe(
      maybePaymentStatuses,
      O.map(paymentStatuses =>
        pipe(
          payments,
          RA.takeLeft(1 + maxVisiblePaymentCount),
          RA.reduce(0, (accumulator, payment) =>
            pipe(
              payment,
              getRptIdStringFromPayment,
              paymentId => paymentStatuses[paymentId],
              O.fromNullable,
              isPaymentReadyOrError,
              B.fold(
                () => accumulator,
                () => 1 + accumulator
              )
            )
          )
        )
      ),
      O.getOrElse(() => 0)
    );

const isPaymentReadyOrError = (
  maybePaymentStatus: O.Option<
    RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
  >
) =>
  pipe(
    maybePaymentStatus,
    O.map(paymentStatus => isReady(paymentStatus) || isError(paymentStatus)),
    O.getOrElse(() => false)
  );

const buttonStateFromUpdatedPaymentCount =
  (
    payments: ReadonlyArray<NotificationPaymentInfo>,
    maxVisiblePaymentCount: number
  ) =>
  (updatedPaymentCount: number) =>
    pipe(payments.length, paymentCount =>
      pipe(
        paymentCount <= maxVisiblePaymentCount &&
          paymentCount === updatedPaymentCount,
        B.fold(
          () =>
            pipe(
              updatedPaymentCount > 0,
              B.fold(
                () => "visibleLoading" as const,
                () => "visibleEnabled" as const
              )
            ),
          () => "hidden" as const
        )
      )
    );
