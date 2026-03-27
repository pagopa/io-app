import { Errors } from "@pagopa/io-react-native-wallet";
import {
  isAssertionGenerationError,
  isPidIssuanceBlockedByAnprError
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

describe("isPidIssuanceBlockedByAnprError", () => {
  it.each([
    Errors.IssuerResponseErrorCodes.CredentialRequestFailed,
    Errors.IssuerResponseErrorCodes.CredentialInvalidStatus
  ])("returns true for %s with HTTP 404", code => {
    const error = new Errors.IssuerResponseError({
      code,
      message: "PID issuance failed",
      reason: {},
      statusCode: 404
    });

    expect(isPidIssuanceBlockedByAnprError(error)).toBe(true);
  });

  it("returns false for issuer errors with a different HTTP status", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.CredentialRequestFailed,
      message: "PID issuance failed",
      reason: {},
      statusCode: 500
    });

    expect(isPidIssuanceBlockedByAnprError(error)).toBe(false);
  });

  it("returns false for non matching issuer codes", () => {
    const error = new Errors.IssuerResponseError({
      code: Errors.IssuerResponseErrorCodes.IssuerGenericError,
      message: "Generic issuer failure",
      reason: {},
      statusCode: 404
    });

    expect(isPidIssuanceBlockedByAnprError(error)).toBe(false);
  });

  it("returns false for non issuer errors", () => {
    expect(isPidIssuanceBlockedByAnprError(new Error("boom"))).toBe(false);
    expect(isPidIssuanceBlockedByAnprError(null)).toBe(false);
  });
});
