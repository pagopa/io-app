import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import { isCieIdAvailable, openCieIdApp } from "..";

jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return "android";
    }
  }
}));
jest.mock("expo-modules-core", () => {
  const module = {
    isAppInstalled: jest.fn(),
    launchCieIdForResult: jest.fn()
  };
  return { requireNativeModule: jest.fn(() => module) };
});

const nativeModule = requireNativeModule("ExpoCieId") as {
  isAppInstalled: jest.Mock;
  launchCieIdForResult: jest.Mock;
};
const signature =
  "92:D1:35:40:D4:50:F6:9F:79:2C:5F:3C:77:0A:E2:85:5B:FB:23:58:B4:47:A8:DE:06:4D:51:D0:35:8E:B6:97";
const scenarios = [
  {
    name: "production",
    environment: "production" as const,
    packageName: "it.ipzs.cieid",
    signature
  },
  {
    name: "pre-production",
    environment: "preprod" as const,
    packageName: "it.ipzs.cieid.collaudo",
    signature: null
  },
  {
    name: "collaudo",
    environment: "coll" as const,
    packageName: "it.ipzs.cieid.coll",
    signature: null
  }
];

describe("CIE ID Expo wrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Platform, "OS", "get").mockReturnValue("android");
  });

  test.each(scenarios)("checks availability in $name", scenario => {
    nativeModule.isAppInstalled.mockReturnValue(true);
    expect(isCieIdAvailable(scenario.environment)).toBe(true);
    expect(nativeModule.isAppInstalled).toHaveBeenCalledWith(
      scenario.packageName,
      scenario.signature
    );
  });

  it("defaults to production and returns false for an unavailable app", () => {
    nativeModule.isAppInstalled.mockReturnValue(false);
    expect(isCieIdAvailable()).toBe(false);
    expect(nativeModule.isAppInstalled).toHaveBeenCalledWith(
      "it.ipzs.cieid",
      signature
    );
  });

  test.each(scenarios)("launches authentication in $name", async scenario => {
    const result = { id: "URL", url: "https://example.com/redirect" };
    nativeModule.launchCieIdForResult.mockResolvedValue(result);
    const callback = jest.fn();
    openCieIdApp("https://example.com/auth", callback, scenario.environment);
    await Promise.resolve();
    expect(nativeModule.launchCieIdForResult).toHaveBeenCalledWith(
      scenario.packageName,
      "it.ipzs.cieid.BaseActivity",
      scenario.signature,
      "https://example.com/auth"
    );
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(result);
  });

  it("forwards authentication errors to the callback", async () => {
    const result = { id: "ERROR", code: "CIEID_OPERATION_CANCEL" };
    nativeModule.launchCieIdForResult.mockResolvedValue(result);
    const callback = jest.fn();
    openCieIdApp("https://example.com/auth", callback);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledWith(result);
  });

  it("converts native rejections to the existing error contract", async () => {
    nativeModule.launchCieIdForResult.mockRejectedValue(
      new Error("Native failure")
    );
    const callback = jest.fn();
    openCieIdApp("https://example.com/auth", callback);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledWith({
      id: "ERROR",
      code: "UNKNOWN_EXCEPTION"
    });
  });

  test.each(scenarios)("checks the iOS scheme in $name", scenario => {
    jest.spyOn(Platform, "OS", "get").mockReturnValue("ios");
    nativeModule.isAppInstalled.mockReturnValue(true);
    expect(isCieIdAvailable(scenario.environment)).toBe(true);
    expect(nativeModule.isAppInstalled).toHaveBeenCalledWith("CIEID", null);
  });

  it("requires Linking on iOS", () => {
    jest.spyOn(Platform, "OS", "get").mockReturnValue("ios");
    expect(() => openCieIdApp("https://example.com/auth", jest.fn())).toThrow(
      "Use Linking.openURL instead."
    );
    expect(nativeModule.launchCieIdForResult).not.toHaveBeenCalled();
  });
});
