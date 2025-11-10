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

export const isMessageGenericError = (
  error: MessagePaymentError
): error is MessageGenericError => error.type === "generic";
export const isMessageSpecificError = (
  error: MessagePaymentError
): error is MessageSpecificError => error.type === "specific";
export const isMessageTimeoutError = (
  error: MessagePaymentError
): error is MessageTimeoutError => error.type === "timeout";

export const isTimeoutOrGenericOrOngoingPaymentError = (
  input: RemoteValue<unknown, MessagePaymentError>
) =>
  isError(input) &&
  (isMessageTimeoutError(input.error) ||
    isMessageGenericError(input.error) ||
    isOngoingPaymentFromDetailV2Enum(input.error.details));

export const toGenericError = (message: string): MessagePaymentError => ({
  type: "generic",
  message
});
export const toSpecificError = (
  details: Detail_v2Enum
): MessagePaymentError => ({
  type: "specific",
  details
});
export const toTimeoutError = (): MessagePaymentError => ({ type: "timeout" });
