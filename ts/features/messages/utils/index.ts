import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  AmountInEuroCents,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Dispatch } from "redux";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { getExpireStatus } from "../../../utils/dates";
import { PaymentData, UIMessageDetails, UIMessageId } from "../types";
import { NetworkError, getNetworkError } from "../../../utils/errors";
import { PaymentAmount } from "../../../../definitions/backend/PaymentAmount";
import { getAmountFromPaymentAmount } from "../../../utils/payment";
import { trackPNPaymentStart } from "../../pn/analytics";
import { addUserSelectedPaymentRptId } from "../store/actions";
import { Action } from "../../../store/actions/types";
import { MessagePaymentExpirationInfo } from "./messages";

export const gapBetweenItemsInAGrid = 8;

const networkErrorToError = (networkError: NetworkError) =>
  networkError.kind === "timeout" ? new Error("timeout") : networkError.value;

export const errorToReason = (error: Error) => error.message;

export const unknownToReason = (e: unknown) =>
  pipe(e, getNetworkError, networkErrorToError, errorToReason);

export const getPaymentExpirationInfo = (
  messageDetails: UIMessageDetails
): MessagePaymentExpirationInfo => {
  const { paymentData, dueDate } = messageDetails;
  if (paymentData && dueDate) {
    const expireStatus = getExpireStatus(dueDate);
    return {
      kind: paymentData.invalidAfterDueDate ? "EXPIRABLE" : "UNEXPIRABLE",
      expireStatus,
      dueDate
    };
  }
  return {
    kind: "UNEXPIRABLE"
  };
};

export const getRptIdStringFromPaymentData = (
  paymentData: PaymentData
): string => `${paymentData.payee.fiscalCode}${paymentData.noticeNumber}`;

export const initializeAndNavigateToWalletForPayment = (
  messageId: UIMessageId,
  paymentId: string,
  isPaidOrHasAnError: boolean,
  paymentAmount: PaymentAmount | undefined,
  canNavigateToPayment: boolean,
  dispatch: Dispatch<Action>,
  isPNPayment: boolean,
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

  if (isPNPayment) {
    trackPNPaymentStart();
  }

  if (!isPaidOrHasAnError) {
    dispatch(addUserSelectedPaymentRptId(paymentId));
  }
  dispatch(paymentInitializeState());

  const initialAmount = pipe(
    paymentAmount,
    O.fromNullable,
    O.map(getAmountFromPaymentAmount),
    O.flatten,
    O.getOrElse(() => "0000" as AmountInEuroCents)
  );

  NavigationService.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
    params: {
      rptId: eitherRptId.right,
      paymentStartOrigin: "message",
      initialAmount,
      messageId
    }
  });
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
