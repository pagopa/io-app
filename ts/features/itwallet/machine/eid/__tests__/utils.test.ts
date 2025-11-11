import { isL3IssuanceFeaturesEnabled } from "../utils";

describe("isL3IssuanceFeaturesEnabled", () => {
  test.each(["l3", "l3-next"] as const)(
    "should return true for issuance level %s",
    level => {
      expect(isL3IssuanceFeaturesEnabled(level)).toBe(true);
    }
  );

  test.each([undefined, "l2", "l2-fallback"] as const)(
    "should return false for issuance level %s",
    level => {
      expect(isL3IssuanceFeaturesEnabled(level)).toBe(false);
    }
  );
});
