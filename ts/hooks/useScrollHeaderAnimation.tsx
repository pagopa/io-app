/* eslint-disable functional/immutable-data */
import {
  HeaderSecondLevel,
  hexToRgba,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useLayoutEffect, useMemo } from "react";
import { ColorValue } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useIOAlertVisible } from "../components/StatusMessages/IOAlertVisibleContext";
import { IOListView } from "../components/ui/IOListView";

const GRADIENT_OPACITY_SCROLL_TRIGGER = 0.85;
const EXTRA_COLOR_STOPS = 20;

type IOViewHeaderScrollValues = ComponentProps<
  typeof HeaderSecondLevel
>["scrollValues"];

export type ScrollAnimationHookProps = {
  headerConfig?: ComponentProps<typeof IOListView>["headerConfig"];
  snapOffset?: number;
};

export const useScrollHeaderAnimation = ({
  snapOffset,
  headerConfig
}: ScrollAnimationHookProps) => {
  const scrollPositionAbsolute = useSharedValue(0);
  const scrollPositionPercentage = useSharedValue(0);
  const theme = useIOTheme();
  const { isAlertVisible } = useIOAlertVisible();
  const navigation = useNavigation();

  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const scrollPosition = contentOffset.y;
      const maxScrollHeight = contentSize.height - layoutMeasurement.height;
      const scrollPercentage =
        maxScrollHeight > 0 ? scrollPosition / maxScrollHeight : 0;

      scrollPositionAbsolute.value = scrollPosition;
      scrollPositionPercentage.value = scrollPercentage;
    }
  );

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollPositionPercentage.value,
      [0, GRADIENT_OPACITY_SCROLL_TRIGGER, 1],
      [1, 1, 0],
      Extrapolation.CLAMP
    )
  }));

  const { colors, locations } = useMemo(
    () =>
      easeGradient({
        colorStops: {
          0: { color: hexToRgba(HEADER_BG_COLOR, 0) },
          1: { color: HEADER_BG_COLOR }
        },
        easing: Easing.ease,
        extraColorStopsPerTransition: EXTRA_COLOR_STOPS
      }),
    [HEADER_BG_COLOR]
  );

  const ignoreSafeAreaMargin = useMemo(() => {
    if (isAlertVisible) {
      return true;
    }
    return headerConfig?.ignoreSafeAreaMargin;
  }, [headerConfig?.ignoreSafeAreaMargin, isAlertVisible]);

  useLayoutEffect(() => {
    const scrollValues: IOViewHeaderScrollValues = {
      contentOffsetY: scrollPositionAbsolute,
      triggerOffset: snapOffset ?? 0
    };

    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel
            {...headerConfig}
            ignoreSafeAreaMargin={ignoreSafeAreaMargin}
            scrollValues={scrollValues}
          />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [
    headerConfig,
    navigation,
    scrollPositionAbsolute,
    snapOffset,
    ignoreSafeAreaMargin
  ]);

  return {
    handleScroll,
    opacityTransition,
    scrollPositionAbsolute,
    scrollPositionPercentage,
    colors,
    locations
  };
};
