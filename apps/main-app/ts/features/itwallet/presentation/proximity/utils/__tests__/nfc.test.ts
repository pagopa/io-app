import { CieUtils } from "@pagopa/io-react-native-cie";
import { Platform } from "react-native";

import { openAppSettings } from "../../../../../../utils/appSettings";
import { openNfcPreferences } from "../nfc";

jest.mock("@pagopa/io-react-native-cie", () => ({
  CieUtils: { openNfcSettings: jest.fn() }
}));

jest.mock("../../../../../../utils/appSettings", () => ({
  openAppSettings: jest.fn()
}));

describe("openNfcPreferences", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test.each([
    { name: "app permissions on iOS", platform: "ios" },
    { name: "NFC activation on Android", platform: "android" }
  ] as const)("opens $name", async ({ platform }) => {
    jest.replaceProperty(Platform, "OS", platform);

    await openNfcPreferences();

    if (platform === "ios") {
      expect(openAppSettings).toHaveBeenCalledTimes(1);
      expect(CieUtils.openNfcSettings).not.toHaveBeenCalled();
    } else {
      expect(CieUtils.openNfcSettings).toHaveBeenCalledTimes(1);
      expect(openAppSettings).not.toHaveBeenCalled();
    }
  });
});
