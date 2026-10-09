import { Platform } from "react-native";

import type { Event } from "../index";

type NativePayload = { attemptsLeft: number; event: string };
const mockListeners = new Map<string, (event: NativePayload) => void>();
const mockNativeCie = {
  addListener: jest.fn(
    (name: string, callback: (event: NativePayload) => void) => {
      mockListeners.set(name, callback);
      return { remove: jest.fn() };
    }
  ),
  setPin: jest.fn(),
  setAuthenticationUrl: jest.fn(),
  setCustomIdpUrl: jest.fn(),
  enableLog: jest.fn(),
  setAlertMessage: jest.fn(),
  start: jest.fn(),
  startListeningNFC: jest.fn(),
  stopListeningNFC: jest.fn(),
  isNFCEnabled: jest.fn(),
  hasNFCFeature: jest.fn(),
  hasApiLevelSupport: jest.fn(),
  openNFCSettings: jest.fn(),
  launchCieID: jest.fn()
};

jest.mock("expo-modules-core", () => ({
  requireNativeModule: (name: string) => {
    expect(name).toBe("ExpoCieSdk");
    return mockNativeCie;
  }
}));

const cieManager = jest.requireActual<{
  default: typeof import("../index").default;
}>("../index").default;

describe("CIE manager Expo compatibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cieManager.removeAllListeners();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("forwards reading events and does not duplicate callbacks", () => {
    const handler = jest.fn();
    const event: Event = { event: "ON_PIN_ERROR", attemptsLeft: 2 };
    cieManager.onEvent(handler);
    cieManager.onEvent(handler);
    mockListeners.get("onEvent")?.(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("unwraps success URLs and converts native errors to Error objects", () => {
    const successHandler = jest.fn();
    const errorHandler = jest.fn();
    cieManager.onSuccess(successHandler);
    cieManager.onError(errorHandler);
    mockListeners.get("onSuccess")?.({
      event: "https://example.com/consent",
      attemptsLeft: 0
    });
    mockListeners.get("onError")?.({ event: "network error", attemptsLeft: 0 });
    expect(successHandler).toHaveBeenCalledWith("https://example.com/consent");
    expect(errorHandler).toHaveBeenCalledWith(new Error("network error"));
  });

  it("removes callbacks while allowing a new reading session", () => {
    const oldHandler = jest.fn();
    const newHandler = jest.fn();
    cieManager.onEvent(oldHandler);
    cieManager.onSuccess(oldHandler);
    cieManager.onError(oldHandler);
    cieManager.removeAllListeners();
    cieManager.onEvent(newHandler);
    const event: Event = { event: "ON_TAG_DISCOVERED", attemptsLeft: 0 };
    ["onEvent", "onSuccess", "onError"].forEach(channel =>
      mockListeners.get(channel)?.(event)
    );
    expect(oldHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledWith(event);
  });

  const compatibilityScenarios = [
    { name: "supported device", nfc: true, api: true, expected: true },
    { name: "missing NFC", nfc: false, api: true, expected: false },
    { name: "unsupported API", nfc: true, api: false, expected: false },
    { name: "unsupported device", nfc: false, api: false, expected: false }
  ];
  it.each(compatibilityScenarios)(
    "checks compatibility: $name",
    async ({ nfc, api, expected }) => {
      mockNativeCie.hasNFCFeature.mockResolvedValueOnce(nfc);
      mockNativeCie.hasApiLevelSupport.mockResolvedValueOnce(api);
      await expect(cieManager.isCIEAuthenticationSupported()).resolves.toBe(
        expected
      );
    }
  );

  it("reports unsupported devices when native capability checks fail", async () => {
    mockNativeCie.hasNFCFeature.mockRejectedValueOnce(new Error("unavailable"));
    await expect(cieManager.isCIEAuthenticationSupported()).resolves.toBe(
      false
    );
  });

  it("propagates PIN validation errors", async () => {
    const error = new Error("invalid PIN");
    mockNativeCie.setPin.mockRejectedValueOnce(error);
    await expect(cieManager.setPin("invalid")).rejects.toBe(error);
    expect(mockNativeCie.setPin).toHaveBeenCalledWith("invalid");
  });

  it("propagates start failures", async () => {
    const error = new Error("missing activity");
    mockNativeCie.start.mockRejectedValueOnce(error);
    await expect(cieManager.start()).rejects.toBe(error);
  });

  it.each([
    { name: "iOS", platform: "ios", expected: 1 },
    { name: "Android", platform: "android", expected: 0 }
  ] as const)(
    "configures alert messages on $name",
    async ({ platform, expected }) => {
      jest.replaceProperty(Platform, "OS", platform);
      mockNativeCie.start.mockResolvedValueOnce(undefined);
      await cieManager.start({ readingInstructions: "localized message" });
      expect(mockNativeCie.setAlertMessage).toHaveBeenCalledTimes(expected);
      if (expected > 0) {
        expect(mockNativeCie.setAlertMessage).toHaveBeenCalledWith(
          "readingInstructions",
          "localized message"
        );
      }
      expect(mockNativeCie.start).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    { name: "omitted URL", url: undefined },
    { name: "null URL", url: null }
  ])("resets the custom IdP to the native default: $name", ({ url }) => {
    cieManager.setCustomIdpUrl(url);
    expect(mockNativeCie.setCustomIdpUrl).toHaveBeenCalledWith(null);
  });
});
