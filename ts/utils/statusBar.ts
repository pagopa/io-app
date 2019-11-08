import { Platform, StatusBar, StatusBarStyle } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import customVariables from "../theme/variables";

export const setStatusBarColorAndBackground = (
  style: StatusBarStyle,
  color: string,
  animated: boolean = true
): void => {
  StatusBar.setBarStyle(style, animated);
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor(color, animated);
  }
};

export const getHeaderHeight =
  customVariables.appHeaderHeight +
  (Platform.OS === "ios"
    ? isIphoneX()
      ? 18
      : getStatusBarHeight(true)
    : customVariables.spacerHeight);
