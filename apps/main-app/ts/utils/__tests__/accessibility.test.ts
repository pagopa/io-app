import { AccessibilityInfo } from "react-native";

import {
  formatStringToSpacedString,
  getAccessibleAmountText,
  getListItemAccessibilityLabelCount,
  isScreenReaderEnabled
} from "../accessibility";

jest.mock("react-native", () => ({
  AccessibilityInfo: {
    setAccessibilityFocus: jest.fn(),
    isScreenReaderEnabled: jest.fn()
  },
  findNodeHandle: jest.fn()
}));

describe("isScreenReaderEnabled", () => {
  it("should return true if screen reader is enabled", async () => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockImplementation(() => Promise.resolve(true));

    const result = await isScreenReaderEnabled();

    expect(result).toBe(true);
  });

  it("should return false if screen reader is not enabled", async () => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockImplementation(() => Promise.resolve(false));

    const result = await isScreenReaderEnabled();

    expect(result).toBe(false);
  });

  it("should return false if an error occurs", async () => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockImplementation(() => Promise.reject(new Error("Error")));

    const result = await isScreenReaderEnabled();

    expect(result).toBe(false);
  });
});

describe("getAccessibleAmountText", () => {
  it("should replace '-' with the localized minus symbol", () => {
    const result = getAccessibleAmountText("-123");

    expect(result).toBe("meno123");
  });

  it("should return undefined if amount is undefined", () => {
    const result = getAccessibleAmountText();

    expect(result).toBeUndefined();
  });
});

describe("formatStringToSpacedString", () => {
  test.each([
    { input: "01234567890", expected: "0 1 2 3 4 5 6 7 8 9 0" },
    { input: "", expected: "" },
    { input: "A", expected: "A" }
  ])("$input → $expected", ({ input, expected }) => {
    expect(formatStringToSpacedString(input)).toBe(expected);
  });
});

describe("getListItemAccessibilityLabelCount", () => {
  it("should return the correct accessibility label with comma", () => {
    const result = getListItemAccessibilityLabelCount(10, 2);

    expect(result).toBe(", Elemento 3 di 10");
  });

  it("should return the correct accessibility label without comma", () => {
    const result = getListItemAccessibilityLabelCount(10, 2, true);

    expect(result).toBe("Elemento 3 di 10");
  });
});
