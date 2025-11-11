import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { isError, RemoteValue } from "../../../common/model/RemoteValue";
import { isOngoingPaymentFromDetailV2Enum } from "../../../utils/payment";

export type MessagePaymentError =
  | MessagePaymentGenericError
  | MessagePaymentSpecificError
  | MessagePaymentTimeoutError;
export type MessagePaymentGenericError = { type: "generic"; message: string };
export type MessagePaymentSpecificError = {
  type: "specific";
  details: Detail_v2Enum;
};
export type MessagePaymentTimeoutError = { type: "timeout" };

export const isMessagePaymentGenericError = (
  error: MessagePaymentError
): error is MessagePaymentGenericError => error.type === "generic";
export const isMessagePaymentSpecificError = (
  error: MessagePaymentError
): error is MessagePaymentSpecificError => error.type === "specific";
export const isMessagePaymentTimeoutError = (
  error: MessagePaymentError
): error is MessagePaymentTimeoutError => error.type === "timeout";

export const isTimeoutOrGenericOrOngoingPaymentError = (
  input: RemoteValue<unknown, MessagePaymentError>
) =>
  isError(input) &&
  (isMessagePaymentTimeoutError(input.error) ||
    isMessagePaymentGenericError(input.error) ||
    isOngoingPaymentFromDetailV2Enum(input.error.details));

export const toGenericMessagePaymentError = (
  message: string
): MessagePaymentError => ({
  type: "generic",
  message
});
export const toSpecificMessagePaymentError = (
  details: Detail_v2Enum
): MessagePaymentError => ({
  type: "specific",
  details
});
export const toTimeoutMessagePaymentError = (): MessagePaymentError => ({
  type: "timeout"
});
