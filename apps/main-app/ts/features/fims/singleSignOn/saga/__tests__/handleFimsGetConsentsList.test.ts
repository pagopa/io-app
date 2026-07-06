import { testable } from "../handleFimsGetConsentsList";
import * as analytics from "../../../../../utils/analytics";

// Mock the analytics module
jest.mock("../../../../../utils/analytics");

describe("handleFimsGetConsentsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("safeParseFailureResponseBody", () => {
    const safeParseFailureResponseBody = testable?.safeParseFailureResponseBody;

    // This test will only run in test environment where testable is defined
    if (!safeParseFailureResponseBody) {
      it.todo("testable is not available (not in test environment)");
      return;
    }

    it("should successfully parse valid JSON and not call trackAppCaughtError", () => {
      const validJson =
        '{"error": "invalid_grant", "error_description": "Invalid credentials"}';
      const mockTrackAppCaughtError =
        analytics.trackAppCaughtError as jest.Mock;

      const result = safeParseFailureResponseBody(validJson);

      expect(result).toEqual({
        error: "invalid_grant",
        error_description: "Invalid credentials"
      });
      expect(mockTrackAppCaughtError).not.toHaveBeenCalled();
    });

    it("should return undefined when JSON.parse throws and call trackAppCaughtError with proper parameters", () => {
      const invalidJson = "{invalid json}";
      const mockTrackAppCaughtError =
        analytics.trackAppCaughtError as jest.Mock;

      const result = safeParseFailureResponseBody(invalidJson);

      expect(result).toBeUndefined();
      expect(mockTrackAppCaughtError).toHaveBeenCalledWith(
        "safeParseFailureResponseBody",
        `JSON.parse threw an exception on a ${invalidJson.length}-character long input string`,
        expect.any(String)
      );
    });
  });
});
