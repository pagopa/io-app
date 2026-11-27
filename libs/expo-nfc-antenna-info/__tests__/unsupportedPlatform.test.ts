jest.mock("react-native", () => ({
  Platform: { OS: "ios" }
}));

jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn()
}));

import { requireNativeModule } from "expo-modules-core";

import {
  getNfcAntennaInfo,
  getNfcAntennaPosition,
  isHceSupported
} from "../index";

describe("without the Android native module", () => {
  test.each([
    { name: "getNfcAntennaInfo", run: getNfcAntennaInfo },
    { name: "getNfcAntennaPosition", run: getNfcAntennaPosition },
    { name: "isHceSupported", run: isHceSupported }
  ])("$name rejects without loading the native module", async ({ run }) => {
    await expect(run()).rejects.toThrow(
      "NfcAntennaInfo is only available on Android devices."
    );
    expect(requireNativeModule).not.toHaveBeenCalled();
  });
});
