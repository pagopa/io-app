import { useMemo } from "react";
import {
  IOColors,
  IOStyles,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation } =
  IOStyles.footer;

export const useBottomTabNavigatorStyle = () => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();
  const insets = useSafeAreaInsets();

  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;

  const tabBarStyle: BottomTabNavigationOptions["tabBarStyle"] = useMemo(
    () => [
      {
        backgroundColor: IOColors[theme["appBackground-primary"]],
        paddingLeft: 3,
        paddingRight: 3,
        borderTopWidth: 0,
        paddingTop: 8,
        zIndex: 1,
        // iOS shadow
        shadowColor,
        shadowOffset,
        shadowOpacity,
        shadowRadius,
        // Android shadow
        elevation
      },
      { height: tabBarHeight + bottomInset },
      themeType === "dark" && {
        borderTopColor: IOColors[theme["divider-default"]],
        borderTopWidth: 1
      },
      insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
    ],
    [bottomInset, insets.bottom, theme, themeType]
  );

  return tabBarStyle;
};
