import { useIsFocused } from "@react-navigation/native";
import { StatusBar, StatusBarProps } from "react-native";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

/**
 * A component that renders the status bar only when the screen is focused.
 * This is useful to avoid conflicts between different screens that might want to set different status bar styles.
 * It also avoids rendering the status bar if a status alert is visible.
 * @param {StatusBarProps} props - The props to pass to the StatusBar component.
 * @returns {JSX.Element | null} The StatusBar component or null.
 */
const FocusAwareStatusBar = (props: StatusBarProps) => {
  /**
   * We want to render the status bar only if the screen is focused
   * to avoid conflicts between different screens
   * that might want to set different status bar styles
   * (e.g. light-content vs dark-content)
   */
  const isFocused = useIsFocused();

  /**
   * If we have status alert, we want to avoid rendering the status bar
   * to avoid conflicts in the background color
   */
  const statusAlert = useStatusAlertProps();

  if (statusAlert || !isFocused) {
    return null;
  }

  return <StatusBar {...props} />;
};

export default FocusAwareStatusBar;
