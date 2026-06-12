import { Errors } from "@pagopa/io-react-native-wallet";
import {
  isAnprPid404Failure,
  isAssertionGenerationError
} from "../itwFailureUtils";

describe("isAssertionGenerationError", () => {
  it("returns true for GENERATION_ASSERTION_FAILED errors", () => {
    expect(
      isAssertionGenerationError(new Error("GENERATION_ASSERTION_FAILED"))
    ).toBe(true);
  });

  it("returns false for other Error messages", () => {
    expect(isAssertionGenerationError(new Error("GENERATION_KEY_FAILED"))).toBe(
      false
    );
    expect(
      isAssertionGenerationError(new Error("REQUEST_ATTESTATION_FAILED"))
    ).toBe(false);
    expect(isAssertionGenerationError(new Error("UNEXPECTED"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isAssertionGenerationError("GENERATION_ASSERTION_FAILED")).toBe(
      false
    );
    expect(isAssertionGenerationError(null)).toBe(false);
    expect(isAssertionGenerationError(undefined)).toBe(false);
    expect(isAssertionGenerationError(42)).toBe(false);
  });
});

describe("isAnprPid404Failure", () => {
  it("returns true for ANPR credential_not_found issuer 404 errors", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialInvalidStatus,
      message: "PID issuance failed",
      reason: { error: "credential_not_found" },
      statusCode: 404
    });

    expect(isAnprPid404Failure(error)).toBe(true);
  });

  it("returns false when credential_not_found is missing from the reason", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialInvalidStatus,
      message: "PID issuance failed",
      reason: { error: "unexpected_error" },
      statusCode: 404
    });

    expect(isAnprPid404Failure(error)).toBe(false);
  });

  it("returns false when the issuer error code does not match", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialRequestFailed,
      message: "PID issuance failed",
      reason: { error: "credential_not_found" },
      statusCode: 404
    });

    expect(isAnprPid404Failure(error)).toBe(false);
  });
});
