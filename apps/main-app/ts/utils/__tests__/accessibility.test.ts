import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { AccessibilityInfo, HostInstance } from "react-native";

import {
  formatStringToSpacedString,
  getAccessibleAmountText,
  getListItemAccessibilityLabelCount,
  isScreenReaderEnabled,
  setAccessibilityFocus
} from "../accessibility";

describe("setAccessibilityFocus", () => {
  const node = {} as HostInstance;
  const nodeReference = { current: node };

  const spyOnSendAccessibilityEvent = () =>
    jest
      .spyOn(AccessibilityInfo, "sendAccessibilityEvent")
      .mockImplementation(() => undefined);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should focus the node and run the callback only once the delay elapsed", () => {
    const focusSpy = spyOnSendAccessibilityEvent();
    const callback = jest.fn();

    setAccessibilityFocus(nodeReference, 300 as Millisecond, callback);

    expect(focusSpy).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    expect(focusSpy).toHaveBeenCalledWith(node, "focus");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should do nothing if the node is not mounted anymore once the delay elapsed", () => {
    const focusSpy = spyOnSendAccessibilityEvent();
    const callback = jest.fn();

    setAccessibilityFocus({ current: null }, 300 as Millisecond, callback);
    jest.advanceTimersByTime(300);

    expect(focusSpy).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should run the callback even if the native focus call throws", () => {
    jest
      .spyOn(AccessibilityInfo, "sendAccessibilityEvent")
      .mockImplementation(() => {
        throw new Error("native failure");
      });
    const callback = jest.fn();

    setAccessibilityFocus(nodeReference, 300 as Millisecond, callback);

    expect(() => jest.advanceTimersByTime(300)).not.toThrow();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should focus the node immediately when no delay is given", () => {
    const focusSpy = spyOnSendAccessibilityEvent();

    setAccessibilityFocus(nodeReference);
    jest.runAllTimers();

    expect(focusSpy).toHaveBeenCalled();
  });
});

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
