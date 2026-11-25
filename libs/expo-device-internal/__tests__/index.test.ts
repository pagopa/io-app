jest.mock("expo-modules-core", () => {
  const nativeModule = {
    getUniqueIdSync: jest.fn(),
    isHapticFeedbackEnabled: jest.fn()
  };
  return {
    requireNativeModule: jest.fn(() => nativeModule)
  };
});

import { requireNativeModule } from "expo-modules-core";

import { getUniqueIdSync, isHapticFeedbackEnabled } from "../index";

const mockGetUniqueIdSync = jest.mocked(
  requireNativeModule<{ getUniqueIdSync: () => string }>("DeviceInternal")
    .getUniqueIdSync
);

describe("getUniqueIdSync", () => {
  beforeEach(() => {
    mockGetUniqueIdSync.mockReset();
  });

  it("loads the identity module", () => {
    expect(requireNativeModule).toHaveBeenCalledWith("DeviceInternal");
  });

  test.each([
    { name: "Android ID", id: "dd96dec43fb81c97" },
    { name: "legacy iOS ID", id: "A6EC2AD1-C3C3-4C64-BAB1-EE49D8F98772" }
  ])("returns the $name synchronously without transforming it", ({ id }) => {
    mockGetUniqueIdSync.mockReturnValue(id);

    expect(getUniqueIdSync()).toBe(id);
    expect(mockGetUniqueIdSync).toHaveBeenCalledTimes(1);
  });

  it("propagates native lookup failures", () => {
    const error = new Error("Keychain access failed");
    mockGetUniqueIdSync.mockImplementation(() => {
      throw error;
    });

    expect(getUniqueIdSync).toThrow(error);
  });
});

describe("isHapticFeedbackEnabled", () => {
  const mockIsHapticFeedbackEnabled = jest.mocked(
    requireNativeModule<{ isHapticFeedbackEnabled: () => boolean }>(
      "DeviceInternal"
    ).isHapticFeedbackEnabled
  );

  beforeEach(() => {
    mockIsHapticFeedbackEnabled.mockReset();
  });

  test.each([
    { name: "enabled", enabled: true },
    { name: "disabled", enabled: false }
  ])("returns the $name native preference synchronously", ({ enabled }) => {
    mockIsHapticFeedbackEnabled.mockReturnValue(enabled);

    expect(isHapticFeedbackEnabled()).toBe(enabled);
    expect(mockIsHapticFeedbackEnabled).toHaveBeenCalledTimes(1);
  });

  it("reads the current preference on every call", () => {
    mockIsHapticFeedbackEnabled
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(isHapticFeedbackEnabled()).toBe(true);
    expect(isHapticFeedbackEnabled()).toBe(false);
    expect(mockIsHapticFeedbackEnabled).toHaveBeenCalledTimes(2);
  });

  it("propagates native settings failures", () => {
    const error = new Error("Android audio service is unavailable");
    mockIsHapticFeedbackEnabled.mockImplementation(() => {
      throw error;
    });

    expect(isHapticFeedbackEnabled).toThrow(error);
  });
});
