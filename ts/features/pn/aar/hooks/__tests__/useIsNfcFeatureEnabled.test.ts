import { Platform } from "react-native";
import { renderHook, act } from "@testing-library/react-native";
import cieSdk from "@pagopa/react-native-cie";
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
    } invoke "cieSdk.isNFCEnabled"`, async () => {
      const spyOnIsNFCEnabled = jest.spyOn(cieSdk, "isNFCEnabled");

      const { result } = renderHook(() => useIsNfcFeatureEnabled());

      await act(async () => {
        await result.current.isNfcEnabled();
      });

      if (isAndroid) {
        expect(spyOnIsNFCEnabled).toHaveBeenCalledTimes(1);
      } else {
        expect(spyOnIsNFCEnabled).not.toHaveBeenCalled();
      }
    });
    it(`${
      isAndroid ? "should" : "should not"
    } invoke "cieSdk.openNFCSettings"`, async () => {
      const spyOnOpenNFCSettings = jest.spyOn(cieSdk, "openNFCSettings");

      const { result } = renderHook(() => useIsNfcFeatureEnabled());

      act(() => {
        result.current.openNFCSettings();
      });

      if (isAndroid) {
        expect(spyOnOpenNFCSettings).toHaveBeenCalledTimes(1);
      } else {
        expect(spyOnOpenNFCSettings).not.toHaveBeenCalled();
      }
    });
  }
);
