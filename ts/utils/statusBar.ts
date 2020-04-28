import { Platform, StatusBar, StatusBarStyle } from "react-native";

export const setStatusBarColorAndBackground = (
  style: StatusBarStyle,
  color: string,
  animated: boolean = true
): void => {
  StatusBar.setBarStyle(style, animated);
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor(color, animated);
  } else {
    StatusBar.setBarStyle(style);
  }
};
