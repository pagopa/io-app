import { Errors } from "@pagopa/io-react-native-wallet";
import {
  isAssertionGenerationError,
  isAnprPidCredentialNotFoundError
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

describe("isAnprPidCredentialNotFoundError", () => {
  it("returns true for CredentialInvalidStatus with HTTP 404 and credential_not_found in the reason", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialInvalidStatus,
      message: "PID issuance failed",
      reason: { error: "credential_not_found" },
      statusCode: 404
    });

    expect(isAnprPidCredentialNotFoundError(error)).toBe(true);
  });

  it("returns false for issuer errors with a different HTTP status", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialInvalidStatus,
      message: "PID issuance failed",
      reason: { error: "credential_not_found" },
      statusCode: 500
    });

    expect(isAnprPidCredentialNotFoundError(error)).toBe(false);
  });

  it("returns false for CredentialRequestFailed with HTTP 404 and credential_not_found in the reason", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialRequestFailed,
      message: "PID issuance failed",
      reason: { error: "credential_not_found" },
      statusCode: 404
    });

    expect(isAnprPidCredentialNotFoundError(error)).toBe(false);
  });

  it("returns false when credential_not_found is missing from the reason", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialInvalidStatus,
      message: "PID issuance failed",
      reason: { error: "unexpected_error" },
      statusCode: 404
    });

    expect(isAnprPidCredentialNotFoundError(error)).toBe(false);
  });

  it("returns false for non matching issuer codes", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.IssuerGenericError,
      message: "Generic issuer failure",
      reason: {},
      statusCode: 404
    });

    expect(isAnprPidCredentialNotFoundError(error)).toBe(false);
  });

  it("returns false for non issuer errors", () => {
    expect(isAnprPidCredentialNotFoundError(new Error("boom"))).toBe(false);
    expect(isAnprPidCredentialNotFoundError(null)).toBe(false);
  });
});
