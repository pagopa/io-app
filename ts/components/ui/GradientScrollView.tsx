import * as React from "react";
import { useMemo } from "react";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WithTestID } from "../../types/WithTestID";
import {
  IOVisualCostants,
  buttonSolidHeight
} from "../core/variables/IOStyles";
import { IOSpacingScale } from "../core/variables/IOSpacing";
import GradientBottomActions from "./GradientBottomActions";

export type GradientScrollView = WithTestID<{
  children: React.ReactNode;
  excludeSafeAreaMargins?: boolean;
  // Accepted components: ButtonSolid, ButtonLink
  // Don't use any components other than this, please.
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
}>;

// Extended gradient area above the actions
export const gradientSafeArea: IOSpacingScale = 80;
// End content margin before the actions
const contentEndMargin: IOSpacingScale = 32;

export const GradientScrollView = ({
  children,
  primaryAction,
  // secondAction,
  // Don't include safe area insets
  excludeSafeAreaMargins = false,
  testID
}: GradientScrollView) => {
  const enableTransition = useSharedValue(1);
  const insets = useSafeAreaInsets();

  /* Check if the iPhone bottom handle is present.
  If not, or if you don't need safe area insets,
  add a default margin to prevent the button
  from sticking to the bottom. */
  const bottomMargin: number = useMemo(
    () =>
      insets.bottom === 0 || excludeSafeAreaMargins
        ? IOVisualCostants.appMarginDefault
        : insets.bottom,
    [insets, excludeSafeAreaMargins]
  );

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

  /* Height of "Actions" area + Content end margin */
  const actionsAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const isEndReached =
        layoutMeasurement.height + contentOffset.y >= contentSize.height;

      // eslint-disable-next-line functional/immutable-data
      enableTransition.value = isEndReached ? 0 : 1;
    }
  );

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(enableTransition.value, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    })
  }));

  return (
    <>
      <Animated.ScrollView
        testID={testID}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          paddingBottom: actionsAreaHeight
        }}
      >
        {children}
      </Animated.ScrollView>
      <GradientBottomActions
        primaryAction={primaryAction}
        transitionAnimStyle={animatedOpacity}
        dimensions={{
          bottomMargin,
          gradientAreaHeight
        }}
      />
    </>
  );
};

export default GradientScrollView;
