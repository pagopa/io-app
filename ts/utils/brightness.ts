import { Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

export const getBrightness = (): Promise<number> => {
  return Platform.OS === "ios"
    ? ScreenBrightness.getBrightness()
    : ScreenBrightness.getAppBrightness();
};

export const setBrightness = (val: number): void => {
  if (Platform.OS === "ios") {
    ScreenBrightness.setBrightness(val);
  } else {
    ScreenBrightness.setAppBrightness(val);
  }
};
