import { RemoteContentDetails } from "@io-app/api-types/generated/definitions/communication/RemoteContentDetails";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Dispatch } from "redux";

import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { Action } from "../../../store/actions/types";
import {
  getNetworkError,
  isTimeoutError,
  NetworkError
} from "../../../utils/errors";
import { startPaymentFlowWithRptIdWorkaround } from "../../payments/checkout/tempWorkaround/pagoPaPaymentWorkaround";
import { addUserSelectedPaymentRptId } from "../store/actions";
import { PaymentData, UIMessage, UIMessageDetails } from "../types";

export const gapBetweenItemsInAGrid = 8;

const networkErrorToError = (networkError: NetworkError) =>
  networkError.kind === "timeout" ? new Error("timeout") : networkError.value;

export const errorToReason = (error: Error) => error.message;

export const unknownToReason = (e: unknown) =>
  pipe(e, getNetworkError, networkErrorToError, errorToReason);

/**
 * Set of failure "reason"s for Mixpanel tracking.
 */
export enum SendFailureReason {
  BAD_FORMAT = "BAD_FORMAT",
  DECODE_ERROR = "DECODE_ERROR",
  HTTP_STATUS_ERROR = "HTTP_STATUS_ERROR",
  MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMITED = "RATE_LIMITED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN"
}

/**
 * Common helper to resolve an HTTP status or caught exception into a `SendFailureReason`.
 */
export type DecodableSendFailure =
  | { error: unknown; kind: "caught" }
  | { kind: "http_status"; status: number };

export const decodeSendFailureReason = (
  failure: DecodableSendFailure
): SendFailureReason => {
  switch (failure.kind) {
    case "caught": {
      const networkError = getNetworkError(failure.error);
      return isTimeoutError(networkError)
        ? SendFailureReason.TIMEOUT
        : SendFailureReason.NETWORK_ERROR;
    }
    case "http_status":
      if (failure.status === 429) {
        return SendFailureReason.RATE_LIMITED;
      }
      if (failure.status === 415) {
        return SendFailureReason.BAD_FORMAT;
      }
      return SendFailureReason.HTTP_STATUS_ERROR;
  }
};

export class WrappedSendError extends Error {
  constructor(
    public readonly reason: SendFailureReason,
    message: string
  ) {
    super(message);
  }
}

export const getRptIdStringFromPaymentData = (
  paymentData: PaymentData
): string => `${paymentData.payee.fiscalCode}${paymentData.noticeNumber}`;

export const initializeAndNavigateToWalletForPayment = (
  paymentId: string,
  shouldUpdateAgainAfterPaymentProcedure: boolean,
  canNavigateToPayment: boolean,
  dispatch: Dispatch<Action>,
  analyticsCallback: (() => void) | undefined,
  decodeErrorCallback: (() => void) | undefined,
  preNavigationCallback: (() => void) | undefined = undefined
) => {
  const eitherRptId = RptIdFromString.decode(paymentId);
  if (E.isLeft(eitherRptId)) {
    decodeErrorCallback?.();
    return;
  }

  preNavigationCallback?.();

  if (!canNavigateToPayment) {
    // Navigating to Wallet home, having the email address is not validated,
    // it will be displayed RemindEmailValidationOverlay
    NavigationService.navigate(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: {
        newMethodAdded: false
      }
    });
    return;
  }

  analyticsCallback?.();

  if (shouldUpdateAgainAfterPaymentProcedure) {
    dispatch(addUserSelectedPaymentRptId(paymentId));
  }

  startPaymentFlowWithRptIdWorkaround(
    eitherRptId.right,
    dispatch,
    NavigationService.navigate,
    { startOrigin: "message" }
  );
};

export const duplicateSetAndAdd = <T>(inputSet: Set<T>, item: T) => {
  const outputSet: Set<T> = new Set<T>(inputSet);
  return outputSet.add(item);
};

export const duplicateSetAndRemove = <T>(inputSet: Set<T>, item: T) => {
  const outputSet: Set<T> = new Set<T>(inputSet);
  outputSet.delete(item);
  return outputSet;
};

export const duplicateSetAndToggle = <A>(inputSet: Set<A>, id: A) =>
  inputSet.has(id)
    ? duplicateSetAndRemove(inputSet, id)
    : duplicateSetAndAdd(inputSet, id);

export const emptyMessageArray: ReadonlyArray<UIMessage> = [];

export const extractContentFromMessageSources = <T>(
  extractionFunction: (input: RemoteContentDetails | UIMessageDetails) => T,
  messageDetails: UIMessageDetails | undefined,
  thirdPartyMessage: ThirdPartyMessageWithContent | undefined
): T | undefined => {
  const thirdPartyMessageDetails =
    thirdPartyMessage?.third_party_message.details;
  if (thirdPartyMessageDetails != null) {
    const decodedThirdPartyMessageDetails = RemoteContentDetails.decode(
      thirdPartyMessageDetails
    );
    if (E.isRight(decodedThirdPartyMessageDetails)) {
      return extractionFunction(decodedThirdPartyMessageDetails.right);
    }
  }

  if (messageDetails != null) {
    return extractionFunction(messageDetails);
  }
  return undefined;
};
