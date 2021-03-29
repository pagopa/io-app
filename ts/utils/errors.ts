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
