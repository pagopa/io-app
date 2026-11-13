import type {
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse
} from "./ExpoHttpClient.types";

/** Code returned by the native client for failures that are not HTTP errors. */
export const NonHttpErrorCode = 900;
export const CancelledMessage = "Cancelled";
export const SerializationFailure = "Serialization Failure";
export const TimeoutMessage = "Timeout";
export const TLSMessage = "TLS Failure";

export const isFailureResponse = (
  response: HttpClientResponse
): response is HttpClientFailureResponse => response.type === "failure";

export const isSuccessResponse = (
  response: HttpClientResponse
): response is HttpClientSuccessResponse => response.type === "success";

const isNonHttpFailure = (
  response: HttpClientResponse,
  message: string
): response is HttpClientFailureResponse =>
  isFailureResponse(response) &&
  response.code === NonHttpErrorCode &&
  response.message === message;

export const isCancelledFailure = (
  response: HttpClientResponse
): response is HttpClientFailureResponse =>
  isNonHttpFailure(response, CancelledMessage);

export const isSerializationFailure = (
  response: HttpClientResponse
): response is HttpClientFailureResponse =>
  isNonHttpFailure(response, SerializationFailure);

export const isTimeoutFailure = (
  response: HttpClientResponse
): response is HttpClientFailureResponse =>
  isNonHttpFailure(response, TimeoutMessage);

export const isTLSFailure = (
  response: HttpClientResponse
): response is HttpClientFailureResponse =>
  isNonHttpFailure(response, TLSMessage);
