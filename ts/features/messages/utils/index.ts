import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Dispatch } from "redux";
import { RemoteContentDetails } from "../../../../definitions/backend/RemoteContentDetails";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { Action } from "../../../store/actions/types";
import { NetworkError, getNetworkError } from "../../../utils/errors";
import { startPaymentFlowWithRptIdWorkaround } from "../../payments/checkout/tempWorkaround/pagoPaPaymentWorkaround";
import { addUserSelectedPaymentRptId } from "../store/actions";
import { ThirdPartyContent } from "../store/reducers/thirdPartyById";
import { PaymentData, UIMessage, UIMessageDetails } from "../types";

export const gapBetweenItemsInAGrid = 8;

const networkErrorToError = (networkError: NetworkError) =>
  networkError.kind === "timeout" ? new Error("timeout") : networkError.value;

export const errorToReason = (error: Error) => error.message;

export const unknownToReason = (e: unknown) =>
  pipe(e, getNetworkError, networkErrorToError, errorToReason);

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
  thirdPartyMessage: ThirdPartyContent | undefined
): T | undefined => {
  const thirdPartyMessageDetails =
    thirdPartyMessage?.content.third_party_message.details;
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
