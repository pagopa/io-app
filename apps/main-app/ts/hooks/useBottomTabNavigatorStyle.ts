import { useIOColors, useIOThemeContext } from "@io-app/design-system";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useBottomTabNavigatorStyle = () => {
  const colors = useIOColors();
  const { themeType } = useIOThemeContext();
  const insets = useSafeAreaInsets();

  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;

  const tabBarStyle: BottomTabNavigationOptions["tabBarStyle"] = useMemo(
    () => [
      {
        backgroundColor: colors.background.default,
        paddingLeft: 3,
        paddingRight: 3,
        borderTopWidth: 0,
        paddingTop: 3,
        zIndex: 1,
        boxShadow: `0px 4px 32px ${colors.surface.shadow}`
      },
      { height: tabBarHeight + bottomInset },
      themeType === "dark" && {
        borderTopColor: colors.stroke.divider,
        borderTopWidth: 1,
        boxShadow: "none"
      },
      insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
    ],
    [bottomInset, colors, insets.bottom, themeType]
  );

  return tabBarStyle;
};
