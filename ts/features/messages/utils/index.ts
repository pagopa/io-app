import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import {
  AmountInEuroCents,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Dispatch } from "redux";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { setMessagesSelectedPayment } from "../store/actions";
import { getExpireStatus } from "../../../utils/dates";
import { PaymentData, UIMessageDetails } from "../types";
import { NetworkError, getNetworkError } from "../../../utils/errors";
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
): string => `${paymentData.payee.fiscalCode}${paymentData.noticeNumber}}`;

export const initializeAndNavigateToWalletForPayment = (
  paymentId: string,
  dispatch: Dispatch<any>,
  decodeErrorCallback: (() => void) | undefined,
  preNavigationCallback: (() => void) | undefined = undefined
) => {
  // TODO

  const eitherRptId = RptIdFromString.decode(paymentId);
  if (E.isLeft(eitherRptId)) {
    decodeErrorCallback?.();
    return;
  }

  preNavigationCallback?.();

  // trackPNPaymentStart(); // TODO

  dispatch(setMessagesSelectedPayment(paymentId));
  dispatch(paymentInitializeState());

  NavigationService.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
    params: {
      rptId: eitherRptId.right,
      paymentStartOrigin: "message",
      initialAmount: "00000" as AmountInEuroCents
    }
  });
};
