import { NetworkError } from "../errors";
import {
  DecodableFailure,
  decodeFailureReason,
  FailureReason,
  FailureReasonError,
  getNetworkErrorFailureReason
} from "../failureReason";

describe("decodeFailureReason", () => {
  it.each<{ expected: FailureReason; failure: DecodableFailure; name: string }>(
    [
      {
        name: "HTTP 401",
        failure: { kind: "http_status", status: 401 },
        expected: FailureReason.SESSION_EXPIRED
      },
      {
        name: "HTTP 415",
        failure: { kind: "http_status", status: 415 },
        expected: FailureReason.BAD_FORMAT
      },
      {
        name: "HTTP 429",
        failure: { kind: "http_status", status: 429 },
        expected: FailureReason.RATE_LIMITED
      },
      {
        name: "HTTP 500",
        failure: { kind: "http_status", status: 500 },
        expected: FailureReason.HTTP_STATUS_ERROR
      },
      {
        name: "a caught max-retries timeout",
        failure: { kind: "caught", error: "max-retries" },
        expected: FailureReason.TIMEOUT
      },
      {
        name: "a caught generic exception",
        failure: { kind: "caught", error: new Error("network down") },
        expected: FailureReason.NETWORK_ERROR
      }
    ]
  )("should return $expected for $name", ({ failure, expected }) => {
    expect(decodeFailureReason(failure)).toBe(expected);
  });
});

describe("getNetworkErrorFailureReason", () => {
  it.each<{ error: NetworkError; expected: FailureReason; name: string }>([
    {
      name: "a timeout",
      error: { kind: "timeout" },
      expected: FailureReason.TIMEOUT
    },
    {
      name: "a FailureReasonError",
      error: {
        kind: "generic",
        value: new FailureReasonError(FailureReason.DECODE_ERROR, "decode")
      },
      expected: FailureReason.DECODE_ERROR
    },
    {
      name: "a plain Error",
      error: { kind: "generic", value: new Error("network down") },
      expected: FailureReason.NETWORK_ERROR
    }
  ])("should return $expected for $name", ({ error, expected }) => {
    expect(getNetworkErrorFailureReason(error)).toBe(expected);
  });
});
