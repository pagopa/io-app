import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { isError, RemoteValue } from "../../../common/model/RemoteValue";
import { isOngoingPaymentFromDetailV2Enum } from "../../../utils/payment";

export type MessagePaymentError =
  | MessageGenericError
  | MessageSpecificError
  | MessageTimeoutError;
export type MessageGenericError = { type: "generic"; message: string };
export type MessageSpecificError = { type: "specific"; details: Detail_v2Enum };
export type MessageTimeoutError = { type: "timeout" };

export const isMessagePaymentGenericError = (
  error: MessagePaymentError
): error is MessageGenericError => error.type === "generic";
export const isMessagePaymentSpecificError = (
  error: MessagePaymentError
): error is MessageSpecificError => error.type === "specific";
export const isMessagePaymentTimeoutError = (
  error: MessagePaymentError
): error is MessageTimeoutError => error.type === "timeout";

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
