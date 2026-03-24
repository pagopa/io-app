import { isAssertionGenerationError } from "../itwFailureUtils";

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
