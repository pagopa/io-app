import type { HttpClientResponse } from "../ExpoHttpClient.types";

import {
  CancelledMessage,
  isCancelledFailure,
  isFailureResponse,
  isSerializationFailure,
  isSuccessResponse,
  isTimeoutFailure,
  isTLSFailure,
  NonHttpErrorCode,
  SerializationFailure,
  TimeoutMessage,
  TLSMessage
} from "../utils";

const failure = (code: number, message: string): HttpClientResponse => ({
  type: "failure",
  code,
  message,
  headers: {}
});
const success: HttpClientResponse = {
  type: "success",
  status: 200,
  body: CancelledMessage,
  headers: {}
};

describe("response guards", () => {
  it("distinguishes success and failure responses", () => {
    expect(isSuccessResponse(success)).toBe(true);
    expect(isFailureResponse(success)).toBe(false);
    expect(isSuccessResponse(failure(500, ""))).toBe(false);
    expect(isFailureResponse(failure(500, ""))).toBe(true);
  });

  test.each([
    { name: "cancelled", guard: isCancelledFailure, message: CancelledMessage },
    {
      name: "serialization",
      guard: isSerializationFailure,
      message: SerializationFailure
    },
    { name: "timeout", guard: isTimeoutFailure, message: TimeoutMessage },
    { name: "TLS", guard: isTLSFailure, message: TLSMessage }
  ])("matches only non-HTTP $name failures", ({ guard, message }) => {
    expect(guard(failure(NonHttpErrorCode, message))).toBe(true);
    expect(guard(failure(NonHttpErrorCode, "Other"))).toBe(false);
    expect(guard(failure(500, message))).toBe(false);
    expect(guard(success)).toBe(false);
  });
});
