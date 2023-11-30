import { useIsFocused } from "@react-navigation/native";
import * as React from "react";
import { StatusBar, StatusBarProps } from "react-native";

/**
 * FocusAwareStatusBar makes the status bar component aware of
 * screen focus and renders it only when the screen is focused.
 * This is needed if you're using a tab or drawer navigator,
 * because all the screens in the navigator might be rendered
 * at once and kept rendered - that means that the last StatusBar
 * config you set will be used (likely on the final tab of your
 * tab navigator, not what the user is seeing).
 */

const FocusAwareStatusBar = (props: StatusBarProps) => {
  const isFocused = useIsFocused();
  return <>{isFocused && <StatusBar {...props} />}</>;
};

export default FocusAwareStatusBar;
