import * as React from "react";
import { StatusBar, StatusBarProps } from "react-native";
import { withNavigationFocus } from "react-navigation";

/**
 * FocusAwareStatusBar makes the status bar component aware of
 * screen focus and renders it only when the screen is focused.
 * This is needed if you're using a tab or drawer navigator,
 * because all the screens in the navigator might be rendered
 * at once and kept rendered - that means that the last StatusBar
 * config you set will be used (likely on the final tab of your
 * tab navigator, not what the user is seeing).
 */
const FocusAwareStatusBar = withNavigationFocus<StatusBarProps>(
  ({ isFocused, ...rest }) => (isFocused ? <StatusBar {...rest} /> : null)
);

export default FocusAwareStatusBar;
