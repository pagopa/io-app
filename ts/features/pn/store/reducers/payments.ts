import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { UIMessageId } from "../../../messages/types";
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
} from "../../../../common/model/RemoteValue";
import {
  clearSelectedPayment,
  setSelectedPayment,
  updatePaymentForMessage
} from "../actions";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import { reloadAllMessages } from "../../../messages/store/actions";

export type MultiplePaymentState = {
  [key: UIMessageId]: SinglePaymentState | undefined;
  selectedPayment?: string;
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
    case getType(setSelectedPayment):
      return {
        ...state,
        selectedPayment: action.payload.paymentId
      };
    case getType(clearSelectedPayment):
      return {
        ...state,
        selectedPayment: undefined
      };
    case getType(reloadAllMessages.request):
      return initialState;
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
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
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
    payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
    maxVisiblePaymentCount: number
  ) =>
  (maybePaymentStatuses: O.Option<SinglePaymentState>) =>
    pipe(
      maybePaymentStatuses,
      O.map(paymentStatuses =>
        pipe(
          payments ?? [],
          RA.takeLeft(maxVisiblePaymentCount),
          RA.reduce(initialPaymentStatistics(), (accumulator, payment) =>
            pipe(
              payment,
              getRptIdStringFromPayment,
              paymentId => paymentStatuses[paymentId],
              O.fromNullable,
              computePaymentStatistics(accumulator)
            )
          )
        )
      ),
      O.getOrElse(() => initialPaymentStatistics())
    );

type PaymentStatistics = {
  updatedPaymentCount: number;
  errorPaymentCount: number;
};

const initialPaymentStatistics: () => PaymentStatistics = () => ({
  updatedPaymentCount: 0,
  errorPaymentCount: 0
});

const updatedPaymentStatistics = (previousStatistics: PaymentStatistics) => ({
  updatedPaymentCount: previousStatistics.updatedPaymentCount + 1,
  errorPaymentCount: previousStatistics.errorPaymentCount
});
const errorPaymentStatistics = (previousStatistics: PaymentStatistics) => ({
  updatedPaymentCount: previousStatistics.updatedPaymentCount + 1,
  errorPaymentCount: previousStatistics.errorPaymentCount + 1
});

const computePaymentStatistics =
  (previousStatistics: PaymentStatistics) =>
  (
    maybePaymentStatus: O.Option<
      RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
    >
  ) =>
    pipe(
      maybePaymentStatus,
      O.map(paymentStatus =>
        pipe(
          isError(paymentStatus),
          B.fold(
            () =>
              pipe(
                isReady(paymentStatus),
                B.fold(
                  () => ({ ...previousStatistics }),
                  () => updatedPaymentStatistics(previousStatistics)
                )
              ),
            () => errorPaymentStatistics(previousStatistics)
          )
        )
      ),
      O.getOrElse(() => ({ ...previousStatistics }))
    );

const buttonStateFromUpdatedPaymentCount =
  (
    payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
    maxVisiblePaymentCount: number
  ) =>
  (updatedPaymentStatistics: PaymentStatistics) =>
    pipe(payments?.length ?? 0, paymentCount =>
      pipe(
        paymentCount <= maxVisiblePaymentCount &&
          paymentCount === updatedPaymentStatistics.errorPaymentCount,
        B.fold(
          () =>
            pipe(
              updatedPaymentStatistics.updatedPaymentCount > 0,
              B.fold(
                () => "visibleLoading" as const,
                () => "visibleEnabled" as const
              )
            ),
          () => "hidden" as const
        )
      )
    );

export const selectedPaymentIdSelector = (state: GlobalState) =>
  state.features.pn.payments.selectedPayment;
