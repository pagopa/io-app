import { pipe } from "fp-ts/lib/function";
import { NetworkError, getNetworkError } from "../../../utils/errors";

const networkErrorToError = (networkError: NetworkError) =>
  networkError.kind === "timeout" ? new Error("timeout") : networkError.value;

export const errorToReason = (error: Error) => error.message;

export const unknownToReason = (e: unknown) =>
  pipe(e, getNetworkError, networkErrorToError, errorToReason);
