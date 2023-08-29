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
import { IOSpacer, IOSpacingScale } from "../core/variables/IOSpacing";
import GradientBottomActions from "./GradientBottomActions";

export type GradientScrollView = WithTestID<{
  children: React.ReactNode;
  excludeSafeAreaMargins?: boolean;
  debugMode?: boolean;
  // Accepted components: ButtonSolid, ButtonLink
  // Don't use any components other than this, please.
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
}>;

// Extended gradient area above the actions
export const gradientSafeArea: IOSpacingScale = 80;
// End content margin before the actions
const contentEndMargin: IOSpacingScale = 32;
// Margin between primary action and secondary one
const spaceBetweenActions: IOSpacer = 24;
// Estimated height of the secondary action
const secondaryActionEstHeight: number = 20;
// Extra bottom margin for iPhone bottom handle
const extraSafeAreaMargin: IOSpacingScale = 8;

export const GradientScrollView = ({
  children,
  primaryAction,
  secondaryAction,
  // Don't include safe area insets
  excludeSafeAreaMargins = false,
  debugMode = false,
  testID
}: GradientScrollView) => {
  const gradientOpacity = useSharedValue(1);
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

  /* When the secondary action is visible, add extra margin
to avoid little space from iPhone bottom handle */
  const extraBottomMargin: number = useMemo(
    () => (secondaryAction && insets.bottom !== 0 ? extraSafeAreaMargin : 0),
    [insets.bottom, secondaryAction]
  );

  /* Total height of actions */
  const actionsArea: number = useMemo(
    () =>
      primaryAction && secondaryAction
        ? buttonSolidHeight +
          spaceBetweenActions +
          secondaryActionEstHeight +
          extraBottomMargin
        : buttonSolidHeight,
    [extraBottomMargin, primaryAction, secondaryAction]
  );

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight: number = useMemo(
    () => bottomMargin + actionsArea + gradientSafeArea,
    [actionsArea, bottomMargin]
  );

  /* Height of the safe bottom area, applied to the ScrollView:
  Actions + Content end margin */
  const safeBottomAreaHeight: number = useMemo(
    () => bottomMargin + actionsArea + contentEndMargin,
    [actionsArea, bottomMargin]
  );

  {
    /* Safe background block. It's added because when
    you swipe up quickly, the content below is visible
    for about 100ms. Without this block, the content
    appears glitchy. */
  }

  const safeBackgroundHeight = useMemo(
    () =>
      secondaryAction
        ? spaceBetweenActions +
          secondaryActionEstHeight +
          extraBottomMargin +
          bottomMargin
        : bottomMargin,
    [bottomMargin, extraBottomMargin, secondaryAction]
  );

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      /* We use Math.floor because decimals used on Android
      devices never change the `isEndReached` boolean value.
      We have more consistent behavior across platforms
      if we round these calculations ¯\_(ツ)_/¯ */
      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  return (
    <>
      <Animated.ScrollView
        testID={testID}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          paddingBottom: safeBottomAreaHeight
        }}
      >
        {children}
      </Animated.ScrollView>
      <GradientBottomActions
        debugMode={debugMode}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        transitionAnimStyle={opacityTransition}
        dimensions={{
          bottomMargin,
          extraBottomMargin,
          gradientAreaHeight,
          spaceBetweenActions,
          safeBackgroundHeight
        }}
      />
    </>
  );
};

export default GradientScrollView;
