import { ComponentProps, ReactNode, useCallback } from "react";
import {
  LayoutChangeEvent,
  Platform,
  ScrollViewProps,
  StyleSheet
} from "react-native";
import Animated, {
  AnimatedRef,
  interpolate,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";
import { IOSpringValues, IOVisualCostants } from "../../core";
import { IconButtonSolid } from "../buttons";
import { FooterActions, useFooterActionsInlineMeasurements } from "../layout";

type ForceScrollDownViewActions = {
  /**
   * The distance from the bottom is computed automatically based on the actions.
   */
  threshold?: never;
  footerActions: Omit<
    ComponentProps<typeof FooterActions>,
    "fixed" | "onMeasure"
  >;
};

type ForceScrollDownViewCustomSlot = {
  /**
   * The distance from the bottom of the scrollable content at which the "scroll to bottom" button
   * should become hidden.
   */
  threshold: number;
  footerActions?: never;
};

type ForceScrollDownViewSlot =
  | ForceScrollDownViewActions
  | ForceScrollDownViewCustomSlot;

export type ForceScrollDownView = {
  /**
   * The content to display inside the scroll view.
   */
  children: ReactNode;
  /**
   * A callback that will be called whenever the scroll view crosses the threshold. The callback
   * is passed a boolean indicating whether the threshold has been crossed (`true`) or not (`false`).
   */
  onThresholdCrossed?: (crossed: boolean) => void;
  /**
   * Optional Animated ref to be used with `useScrollOffset`
   * (outside this component)
   */
  animatedRef?: AnimatedRef<Animated.ScrollView>;
} & ForceScrollDownViewSlot &
  Pick<
    ScrollViewProps,
    "style" | "contentContainerStyle" | "scrollEnabled" | "testID"
  >;

/**
 * A React Native component that displays a scroll view with a button that scrolls to the bottom of the content
 * when pressed. The button is hidden when the scroll view reaches a certain threshold from the bottom, which is
 * configurable by the `threshold` prop. The button, and the scrolling, can also be disabled by setting the
 * `scrollEnabled` prop to `false`.
 */
const ForceScrollDownView = ({
  footerActions,
  children,
  threshold: customThreshold,
  style,
  contentContainerStyle,
  scrollEnabled = true,
  onThresholdCrossed,
  animatedRef
}: ForceScrollDownView) => {
  const internalAnimatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollViewRef = animatedRef ?? internalAnimatedRef;
  const insets = useSafeAreaInsets();

  const {
    footerActionsInlineMeasurements,
    handleFooterActionsInlineMeasurements
  } = useFooterActionsInlineMeasurements();

  const threshold = footerActions
    ? footerActionsInlineMeasurements.safeBottomAreaHeight
    : customThreshold;

  /**
   * Whether or not the "scroll to bottom" button should be visible. This is controlled by the threshold
   * and the current scroll position.
   */
  // const [isButtonVisible, setButtonVisible] = useState(true);

  const isButtonVisible = useSharedValue(1);
  const scrollViewHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const offsetY = useScrollOffset(scrollViewRef);

  useAnimatedReaction(
    () =>
      scrollViewHeight.value + Math.max(offsetY.value, 0) >=
      contentHeight.value - (threshold ?? 0),
    (crossed, previous) => {
      if (crossed !== previous) {
        // eslint-disable-next-line functional/immutable-data
        isButtonVisible.value = withSpring(
          crossed && scrollEnabled ? 0 : 1,
          IOSpringValues.button
        );
        if (onThresholdCrossed) {
          scheduleOnRN(onThresholdCrossed, crossed);
        }
      }
    }
  );

  /**
   * A callback that is called whenever the size of the scrollable content changes. It updates the
   * state with the new content height.
   */
  const handleContentSizeChange = useCallback(
    // eslint-disable-next-line functional/immutable-data
    (_w: number, h: number) => (contentHeight.value = h),
    [contentHeight]
  );

  /**
   * A callback that is called whenever the size of the scroll view changes. It updates the state
   * with the new scroll view height.
   */
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) =>
      // eslint-disable-next-line functional/immutable-data
      (scrollViewHeight.value = event.nativeEvent.layout.height),
    [scrollViewHeight]
  );

  /**
   * A callback that is called when the "scroll to bottom" button is pressed. It scrolls the
   * scroll view to the bottom and hides the button.
   */
  const handleScrollDownPress = useCallback(() => {
    scheduleOnUI(() => {
      "worklet";
      // eslint-disable-next-line functional/immutable-data
      isButtonVisible.value = withSpring(0, IOSpringValues.button);
      const targetY = Math.max(0, contentHeight.value - scrollViewHeight.value);
      scrollTo(scrollViewRef, 0, targetY, true);
    });
  }, [scrollViewRef, contentHeight, scrollViewHeight, isButtonVisible]);

  /**
   * The "scroll to bottom" button component. It is wrapped in a reanimated View
   * and has animated style applied to it.
   */

  const buttonTransitionStyle = useAnimatedStyle(() => {
    const androidEdgeToEdgeMargin = Platform.OS === "ios" ? 0 : insets.bottom;
    return {
      bottom: IOVisualCostants.scrollDownButtonBottom + androidEdgeToEdgeMargin,
      opacity: isButtonVisible.value,
      transform: [
        { scale: interpolate(isButtonVisible.value, [0, 1], [0.5, 1]) }
      ]
    };
  });

  const scrollDownButton = (
    <Animated.View style={[styles.scrollDownButton, buttonTransitionStyle]}>
      <IconButtonSolid
        testID={"ScrollDownButton"}
        accessibilityLabel="Scroll to bottom"
        icon="arrowBottom"
        onPress={handleScrollDownPress}
      />
    </Animated.View>
  );

  return (
    <>
      <Animated.ScrollView
        testID={"ScrollView"}
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        style={style}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
        {footerActions && (
          <FooterActions
            {...footerActions}
            onMeasure={handleFooterActionsInlineMeasurements}
            fixed={false}
          />
        )}
      </Animated.ScrollView>
      {scrollDownButton}
    </>
  );
};

const styles = StyleSheet.create({
  scrollDownButton: {
    position: "absolute",
    zIndex: 10,
    right: IOVisualCostants.scrollDownButtonRight
  }
});

export { ForceScrollDownView };
