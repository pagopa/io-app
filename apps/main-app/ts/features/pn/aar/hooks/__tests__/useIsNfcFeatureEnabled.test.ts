import { CieUtils } from "@io-app/expo-cie";
import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";

import { useIsNfcFeatureEnabled } from "../useIsNfcFeatureEnabled";

const platforms: ReadonlyArray<typeof Platform.OS> = ["android", "ios"];
const getIsAndroid = (platform: typeof Platform.OS) => platform === "android";

describe.each(platforms)(
  'useIsNfcFeatureEnabled when "Platform.OS" is "%s"',
  platform => {
    const isAndroid = getIsAndroid(platform);

    beforeAll(() => {
      jest.replaceProperty(Platform, "OS", platform);
    });

    afterAll(jest.clearAllMocks);

    it(`${
      isAndroid ? "should" : "should not"
    } invoke "CieUtils.isNfcEnabled"`, async () => {
      const spyOnIsNfcEnabled = jest.spyOn(CieUtils, "isNfcEnabled");

      const { result } = renderHook(() => useIsNfcFeatureEnabled());

      await act(async () => {
        await result.current.isNfcEnabled();
      });

      if (isAndroid) {
        expect(spyOnIsNfcEnabled).toHaveBeenCalledTimes(1);
      } else {
        expect(spyOnIsNfcEnabled).not.toHaveBeenCalled();
      }
    });
    it(`${
      isAndroid ? "should" : "should not"
    } invoke "CieUtils.openNfcSettings"`, async () => {
      const spyOnOpenNfcSettings = jest.spyOn(CieUtils, "openNfcSettings");

      const { result } = renderHook(() => useIsNfcFeatureEnabled());

      act(() => {
        result.current.openNFCSettings();
      });

      if (isAndroid) {
        expect(spyOnOpenNfcSettings).toHaveBeenCalledTimes(1);
      } else {
        expect(spyOnOpenNfcSettings).not.toHaveBeenCalled();
      }
    });
  }
);
