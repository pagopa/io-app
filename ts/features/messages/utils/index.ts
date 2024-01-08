import { pipe } from "fp-ts/lib/function";
import { NetworkError, getNetworkError } from "../../../utils/errors";
import { UIMessageDetails } from "../types";
import { getExpireStatus } from "../../../utils/dates";
import { MessagePaymentExpirationInfo } from "./messages";

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
