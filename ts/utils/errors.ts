import { Detail_v2Enum } from "../../definitions/backend/PaymentProblemJson";
import { MessagesFailurePayload } from "../features/messages/store/actions";

export type TimeoutError = { readonly kind: "timeout" };
export type GenericError = { readonly kind: "generic"; value: Error };
export type NetworkError = TimeoutError | GenericError;

/**
 * return an error starting from an unknown input value
 */
export const getError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  } else if (error instanceof String) {
    return Error(error as string);
  }
  return Error("unknown");
};

export const getNetworkError = (error: unknown): NetworkError => {
  if (
    error === "max-retries" ||
    (error instanceof Error && error.message === "max-retries")
  ) {
    return { kind: "timeout" };
  }
  return { kind: "generic", value: getError(error) };
};

export const getGenericError = (error: Error): GenericError => ({
  kind: "generic",
  value: error
});

export const getTimeoutError = (): TimeoutError => ({ kind: "timeout" });

export const isTimeoutError = (error: NetworkError): error is TimeoutError =>
  error.kind === "timeout";

export const getNetworkErrorMessage = (error: NetworkError): string =>
  isTimeoutError(error) ? error.kind : error.value.message;

export const getErrorFromNetworkError = (networkError: NetworkError): Error => {
  switch (networkError.kind) {
    case "timeout":
      return new Error("Timeout Error");
    case "generic":
      return networkError.value;
  }
};

/**
 * Convert an `unknown` variable to a generic `Error`.
 */
export const convertUnknownToError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(`${e}`);

/**
 * Convert an `unknown` variable to a `Detail_v2Enum`.
 */
export const getWalletError = (e: unknown): Detail_v2Enum => {
  const message =
    typeof e === "object" && e !== null && "message" in e
      ? `${(e as any).message}`
      : null;

  return message && message in Detail_v2Enum
    ? (message as Detail_v2Enum)
    : Detail_v2Enum.GENERIC_ERROR;
};

/**
 * Convert an `unknown` variable to a `MessagesFailurePayload`.
 */
export const convertUnknownToMessagesFailure = (
  e: unknown
): MessagesFailurePayload => {
  // If this is actually a `MessagesFailurePayload` then return it.
  if (typeof e === "object" && e !== null && "error" in e && "filter" in e) {
    return e as MessagesFailurePayload;
  }

  // Otherwise create a new `MessagesFailurePayload` ad-hoc.
  return {
    error: convertUnknownToError(e),
    filter: {}
  };
};
