import { useMemo } from "react";
import { IOColors } from "@pagopa/io-app-design-system";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import variables from "../theme/variables";

export const useBottomTabNavigatorStyle = () => {
  const insets = useSafeAreaInsets();

  const tabBarHeight = 54;
  const additionalPadding = 10;
  const bottomInset = insets.bottom === 0 ? additionalPadding : insets.bottom;

  const tabBarStyle: Animated.WithAnimatedValue<StyleProp<ViewStyle>> = useMemo(
    () => [
      {
        backgroundColor: IOColors.white,
        paddingLeft: 3,
        paddingRight: 3,
        borderTopWidth: 0,
        paddingTop: 8,
        // iOS shadow
        shadowColor: variables.footerShadowColor,
        shadowOffset: {
          width: variables.footerShadowOffsetWidth,
          height: variables.footerShadowOffsetHeight
        },
        zIndex: 999,
        shadowOpacity: variables.footerShadowOpacity,
        shadowRadius: variables.footerShadowRadius,
        // Android shadow
        elevation: variables.footerElevation
      },
      { height: tabBarHeight + bottomInset },
      insets.bottom === 0 ? { paddingBottom: additionalPadding } : {}
    ],
    [bottomInset, insets.bottom]
  );

  return tabBarStyle;
};
