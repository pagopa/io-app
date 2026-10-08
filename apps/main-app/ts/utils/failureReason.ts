import { getNetworkError, isTimeoutError, NetworkError } from "./errors";

export enum FailureReason {
  BAD_FORMAT = "BAD_FORMAT",
  DECODE_ERROR = "DECODE_ERROR",
  HTTP_STATUS_ERROR = "HTTP_STATUS_ERROR",
  MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMITED = "RATE_LIMITED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  TIMEOUT = "TIMEOUT"
}

enum HttpStatus {
  UNAUTHORIZED = 401,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429
}

export type DecodableFailure =
  | { error: unknown; kind: "caught" }
  | { kind: "http_status"; status: number };

export const decodeFailureReason = (
  failure: DecodableFailure
): FailureReason => {
  switch (failure.kind) {
    case "caught":
      return isTimeoutError(getNetworkError(failure.error))
        ? FailureReason.TIMEOUT
        : FailureReason.NETWORK_ERROR;
    case "http_status":
      switch (failure.status) {
        case HttpStatus.TOO_MANY_REQUESTS:
          return FailureReason.RATE_LIMITED;
        case HttpStatus.UNAUTHORIZED:
          return FailureReason.SESSION_EXPIRED;
        case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
          return FailureReason.BAD_FORMAT;
        default:
          return FailureReason.HTTP_STATUS_ERROR;
      }
  }
};

export class FailureReasonError extends Error {
  constructor(
    public readonly reason: FailureReason,
    message: string
  ) {
    super(message);
  }
}

export const getNetworkErrorFailureReason = (
  error: NetworkError
): FailureReason => {
  if (isTimeoutError(error)) {
    return FailureReason.TIMEOUT;
  }
  return error.value instanceof FailureReasonError
    ? error.value.reason
    : FailureReason.NETWORK_ERROR;
};
