type TimeoutError = { readonly kind: "timeout" };
type GenericError = { kind: "generic"; value: Error };
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
  if (error === "max-retries") {
    return { kind: "timeout" };
  }
  return { kind: "generic", value: getError(error) };
};
