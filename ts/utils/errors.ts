import { isString as lodashIsString } from "lodash";
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
  } else if (lodashIsString(error)) {
    return Error(error);
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

/**
 * Serializes an Error object into a plain object that can be safely
 * converted to JSON using `JSON.stringify()`.
 *
 * This is needed because `JSON.stringify(error)` returns `"{}"` for Error objects.
 * The reason is that the standard Error properties (`name`, `message`, `stack`)
 * are **non-enumerable** by default, and `JSON.stringify()` only serializes
 * enumerable own properties.
 *
 * @param error - The Error object to serialize
 * @returns A plain object containing `name`, `message`, and `stack` properties
 *
 * @example
 * const error = new Error("Something went wrong");
 * JSON.stringify(error); // "{}" - properties are non-enumerable!
 * JSON.stringify(serializeError(error)); // {"name":"Error","message":"Something went wrong","stack":"..."}
 */
export const serializeError = (error: Error) => ({
  name: error.name,
  message: error.message,
  stack: error.stack
});
