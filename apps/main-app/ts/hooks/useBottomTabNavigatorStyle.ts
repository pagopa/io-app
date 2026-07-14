import {
  hexToRgba,
  IOColors,
  useIOTheme,
  useIOThemeContext
} from "@io-app/design-system";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
        boxShadow: `0px 4px 32px ${hexToRgba(IOColors.black, 0.1)}`
      },
      { height: tabBarHeight + bottomInset },
      themeType === "dark" && {
        borderTopColor: IOColors[theme["divider-default"]],
        borderTopWidth: 1,
        boxShadow: "none"
      },
      insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
    ],
    [bottomInset, insets.bottom, theme, themeType]
  );

  return tabBarStyle;
};
