import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { isTestEnv } from "../../../../utils/environment";
import { Action } from "../../../../store/actions/types";
import { UIMessageDetails, UIMessageId } from "../../types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  foldK,
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
  addUserSelectedPaymentRptId,
  cancelQueuedPaymentUpdates,
  isGenericError,
  isSpecificError,
  isTimeoutError,
  PaymentError,
  reloadAllMessages,
  updatePaymentForMessage
} from "../actions";
import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import { isProfileEmailValidatedSelector } from "../../../settings/common/store/selectors";
import { isPagoPaSupportedSelector } from "../../../../common/versionInfo/store/reducers/versionInfo";
import {
  duplicateSetAndAdd,
  duplicateSetAndRemove,
  getRptIdStringFromPaymentData
} from "../../utils";
import {
  isExpiredPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum,
  isPaidPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum
} from "../../../../utils/payment";
import { messagePaymentDataSelector } from "./detailsById";

export type MultiplePaymentState = {
  [key: UIMessageId]: SinglePaymentState | undefined;
  userSelectedPayments: Set<string>;
};

export type SinglePaymentState = {
  [key: string]: RemoteValue<PaymentInfoResponse, PaymentError> | undefined;
};

export type PaymentStatistics = {
  paymentCount: number;
  unpaidCount: number;
  paidCount: number;
  errorCount: number;
  expiredCount: number;
  revokedCount: number;
  ongoingCount: number;
};

const initialPaymentStatistics = (paymentCount: number): PaymentStatistics => ({
  paymentCount,
  unpaidCount: 0,
  paidCount: 0,
  errorCount: 0,
  expiredCount: 0,
  revokedCount: 0,
  ongoingCount: 0
});

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
          [action.payload.paymentId]: remoteError(action.payload.reason)
        }
      };
    case getType(cancelQueuedPaymentUpdates): {
      const messageId = action.payload.messageId;
      const messagePayments = state[messageId];
      return messagePayments != null
        ? {
            ...state,
            [messageId]: purgePaymentsWithIncompleteData(messagePayments)
          }
        : state;
    }
    case getType(addUserSelectedPaymentRptId):
      return {
        ...state,
        userSelectedPayments: duplicateSetAndAdd(
          state.userSelectedPayments,
          action.payload
        )
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
) => pipe(paymentStateSelector(state, messageId, paymentId), isUndefined);

export const paymentStatusForUISelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
): RemoteValue<PaymentInfoResponse, PaymentError> =>
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

const paymentStateSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentId: string
) =>
  pipe(
    state.entities.messages.payments[messageId],
    O.fromNullable,
    O.chainNullableK(multiplePaymentState => multiplePaymentState[paymentId]),
    O.getOrElse<RemoteValue<PaymentInfoResponse, PaymentError>>(
      () => remoteUndefined
    )
  );

const purgePaymentsWithIncompleteData = (state: SinglePaymentState) => {
  const isTimeoutOrGenericError = (input: RemoteValue<unknown, PaymentError>) =>
    isError(input) &&
    (isTimeoutError(input.error) || isGenericError(input.error));

  return Object.entries(state).reduce((acc, [key, value]) => {
    if (value == null || isLoading(value) || isTimeoutOrGenericError(value)) {
      return { ...acc, [key]: undefined };
    }
    return { ...acc, [key]: value };
  }, {} as SinglePaymentState);
};

export const paymentStatisticsForMessageUncachedSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  paymentCount: number,
  paymentIds: ReadonlyArray<string>
): PaymentStatistics | undefined => {
  try {
    return paymentIds.reduce((accumulator, paymentId) => {
      const paymentStatus = paymentStateSelector(state, messageId, paymentId);
      if (isReady(paymentStatus)) {
        return {
          ...accumulator,
          unpaidCount: accumulator.unpaidCount + 1
        };
      } else if (isError(paymentStatus)) {
        return paymentErrorToPaymentStatistics(
          accumulator,
          paymentStatus.error
        );
      } else {
        throw Error("Data is not ready");
      }
    }, initialPaymentStatistics(paymentCount));
  } catch (e) {
    return undefined;
  }
};

const paymentErrorToPaymentStatistics = (
  accumulator: PaymentStatistics,
  paymentError: PaymentError
): PaymentStatistics => {
  if (isSpecificError(paymentError)) {
    const details = paymentError.details;
    if (isPaidPaymentFromDetailV2Enum(details)) {
      return {
        ...accumulator,
        paidCount: accumulator.paidCount + 1
      };
    } else if (isExpiredPaymentFromDetailV2Enum(details)) {
      return {
        ...accumulator,
        expiredCount: accumulator.expiredCount + 1
      };
    } else if (isRevokedPaymentFromDetailV2Enum(details)) {
      return {
        ...accumulator,
        revokedCount: accumulator.revokedCount + 1
      };
    } else if (isOngoingPaymentFromDetailV2Enum(details)) {
      return {
        ...accumulator,
        ongoingCount: accumulator.ongoingCount + 1
      };
    } else {
      return {
        ...accumulator,
        errorCount: accumulator.errorCount + 1
      };
    }
  } else {
    return {
      ...accumulator,
      errorCount: accumulator.errorCount + 1
    };
  }
};

export const testable = isTestEnv
  ? {
      initialPaymentStatistics,
      paymentErrorToPaymentStatistics,
      paymentStateSelector,
      purgePaymentsWithIncompleteData
    }
  : undefined;
