import { Platform } from "react-native";
import { platformSelect } from "..";

describe("platformSelect", () => {
  afterEach(jest.clearAllMocks);

  it.each<Parameters<typeof platformSelect>[number] & { default: any }>([
    {
      ios: "ios",
      android: "android",
      default: "default"
    },
    {
      ios: {},
      web: {},
      default: null
    },
    {
      ios: [],
      android: {},
      default: null
    },
    {
      ios: () => null,
      default: () => undefined
    }
  ])(
    "should invoke Platform.select with the right specifics object (%o)",
    specifics => {
      const spyOnNativePlatformSelect = jest.spyOn(Platform, "select");

      platformSelect(specifics);

      expect(spyOnNativePlatformSelect).toHaveBeenCalledTimes(1);
      expect(spyOnNativePlatformSelect).toHaveBeenCalledWith(specifics);
    }
  );
});
