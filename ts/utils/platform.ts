import { Platform } from "react-native";

export const isIos = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export const getMajorIosVersion = (): number => {
  if (Platform.OS !== "ios") {
    throw Error("Platform is not iOS");
  }

  return parseInt(Platform.Version, 10);
};
