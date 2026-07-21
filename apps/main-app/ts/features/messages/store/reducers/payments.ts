import { getType } from "typesafe-actions";

import { PaymentInfoResponse } from "../../../../../definitions/communication/PaymentInfoResponse";
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
import { isPagoPaSupportedSelector } from "../../../../common/versionInfo/store/reducers/versionInfo";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { isTestEnv } from "../../../../utils/environment";
import {
  isExpiredPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum,
  isPaidPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum
} from "../../../../utils/payment";
import { isProfileEmailValidatedSelector } from "../../../settings/common/store/selectors";
import { UIMessageDetails } from "../../types";
import {
  isMessagePaymentSpecificError,
  isTimeoutOrGenericOrOngoingPaymentError,
  MessagePaymentError
} from "../../types/paymentErrors";
import {
  duplicateSetAndAdd,
  duplicateSetAndRemove,
  getRptIdStringFromPaymentData
} from "../../utils";
import {
  addUserSelectedPaymentRptId,
  cancelQueuedPaymentUpdates,
  reloadAllMessages,
  updatePaymentForMessage
} from "../actions";
import { messagePaymentDataSelector } from "./detailsById";

export type MultiplePaymentState = {
  paymentStatusListById: {
    [key: string]: SinglePaymentState | undefined;
  };
  userSelectedPayments: Set<string>;
};

export type PaymentStatistics = {
  errorCount: number;
  expiredCount: number;
  ongoingCount: number;
  paidCount: number;
  paymentCount: number;
  revokedCount: number;
  unpaidCount: number;
};

export type SinglePaymentState = {
  [key: string]:
    | RemoteValue<PaymentInfoResponse, MessagePaymentError>
    | undefined;
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
  paymentStatusListById: {},
  userSelectedPayments: new Set<string>()
};

export const paymentsReducer = (
  state: MultiplePaymentState = initialState,
  action: Action
): MultiplePaymentState => {
  switch (action.type) {
    case getType(addUserSelectedPaymentRptId):
      return {
        ...state,
        userSelectedPayments: duplicateSetAndAdd(
          state.userSelectedPayments,
          action.payload
        )
      };
    case getType(cancelQueuedPaymentUpdates): {
      const messageId = action.payload.messageId;
      const messagePayments = state.paymentStatusListById[messageId];
      return messagePayments != null
        ? {
            ...state,
            paymentStatusListById: {
              ...state.paymentStatusListById,
              [messageId]: purgePaymentsWithIncompleteData(messagePayments)
            }
          }
        : state;
    }
    case getType(reloadAllMessages.request):
      return initialState;
    case getType(updatePaymentForMessage.failure):
      return {
        ...state,
        paymentStatusListById: {
          ...state.paymentStatusListById,
          [action.payload.messageId]: {
            ...state.paymentStatusListById[action.payload.messageId],
            [action.payload.paymentId]: remoteError(action.payload.reason)
          }
        }
      };
    case getType(updatePaymentForMessage.request):
      return {
        ...state,
        paymentStatusListById: {
          ...state.paymentStatusListById,
          [action.payload.messageId]: {
            ...state.paymentStatusListById[action.payload.messageId],
            [action.payload.paymentId]: remoteLoading
          }
        },
        userSelectedPayments: duplicateSetAndRemove(
          state.userSelectedPayments,
          action.payload.paymentId
        )
      };
    case getType(updatePaymentForMessage.success):
      return {
        ...state,
        paymentStatusListById: {
          ...state.paymentStatusListById,
          [action.payload.messageId]: {
            ...state.paymentStatusListById[action.payload.messageId],
            [action.payload.paymentId]: remoteReady(action.payload.paymentData)
          }
        }
      };
  }
  return state;
};

export const shouldRetrievePaymentDataSelector = (
  state: GlobalState,
  messageId: string,
  paymentId: string
) => isUndefined(paymentStateSelector(state, messageId, paymentId));

export const paymentStatusForUISelector = (
  state: GlobalState,
  messageId: string,
  paymentId: string
): RemoteValue<PaymentInfoResponse, MessagePaymentError> => {
  const remoteValue = paymentStateSelector(state, messageId, paymentId);
  return isLoading(remoteValue) ? remoteUndefined : remoteValue;
};

export const isUserSelectedPaymentSelector = (
  state: GlobalState,
  rptId: string
) => state.entities.messages.payments.userSelectedPayments.has(rptId);

export const userSelectedPaymentRptIdSelector = (
  state: GlobalState,
  messageOrUndefined: UIMessageDetails | undefined
) => {
  const paymentData = messageOrUndefined?.paymentData;
  if (paymentData == null) {
    return undefined;
  }

  const rptId = getRptIdStringFromPaymentData(paymentData);
  return isUserSelectedPaymentSelector(state, rptId) ? rptId : undefined;
};

export const canNavigateToPaymentFromMessageSelector = (state: GlobalState) =>
  isProfileEmailValidatedSelector(state) && isPagoPaSupportedSelector(state);

export const paymentsButtonStateSelector = (
  state: GlobalState,
  messageId: string
) => {
  const paymentData = messagePaymentDataSelector(state, messageId);
  if (paymentData == null) {
    return "hidden";
  }

  const paymentId = getRptIdStringFromPaymentData(paymentData);
  const paymentStatus = paymentStateSelector(state, messageId, paymentId);
  switch (paymentStatus.kind) {
    case "error":
      return "hidden";
    case "loading":
    case "undefined":
      return "loading";
    case "ready":
      return "enabled";
  }
};

export const isPaymentsButtonVisibleSelector = (
  state: GlobalState,
  messageId: string
) => paymentsButtonStateSelector(state, messageId) !== "hidden";

const paymentStateSelector = (
  state: GlobalState,
  messageId: string,
  paymentId: string
) =>
  state.entities.messages.payments.paymentStatusListById[messageId]?.[
    paymentId
  ] ?? remoteUndefined;

const purgePaymentsWithIncompleteData = (state: SinglePaymentState) =>
  Object.entries(state).reduce((acc, [key, value]) => {
    if (
      value == null ||
      isLoading(value) ||
      isTimeoutOrGenericOrOngoingPaymentError(value)
    ) {
      return { ...acc, [key]: undefined };
    }
    return { ...acc, [key]: value };
  }, {} as SinglePaymentState);

export const paymentStatisticsForMessageUncachedSelector = (
  state: GlobalState,
  messageId: string,
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
  } catch {
    return undefined;
  }
};

const paymentErrorToPaymentStatistics = (
  accumulator: PaymentStatistics,
  paymentError: MessagePaymentError
): PaymentStatistics => {
  if (isMessagePaymentSpecificError(paymentError)) {
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
