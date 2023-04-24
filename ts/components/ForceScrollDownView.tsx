import React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet
} from "react-native";
import IconButtonSolid from "./ui/IconButtonSolid";
import { ScaleInOutAnimation } from "./animations/ScaleInOutAnimation";

type ForceScrollDownViewProps = {
  /**
   * The content to display inside the scroll view.
   */
  children: React.ReactNode;
  /**
   * The distance from the bottom of the scrollable content at which the "scroll to bottom" button
   * should become hidden. Defaults to 100.
   */
  threshold?: number;
  /**
   * A callback that will be called whenever the scroll view crosses the threshold. The callback
   * is passed a boolean indicating whether the threshold has been crossed (`true`) or not (`false`).
   */
  onThresholdCrossed?: (crossed: boolean) => void;
} & Pick<
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
  children,
  threshold = 100,
  style,
  contentContainerStyle,
  scrollEnabled = true,
  onThresholdCrossed
}: ForceScrollDownViewProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  /**
   * The height of the scroll view, used to determine whether or not the scrollable content fits inside
   * the scroll view and whether the "scroll to bottom" button should be displayed.
   */
  const [scrollViewHeight, setScrollViewHeight] = React.useState<number>();

  /**
   * The height of the scrollable content, used to determine whether or not the "scroll to bottom" button
   * should be displayed.
   */
  const [contentHeight, setContentHeight] = React.useState<number>();

  /**
   * Whether or not the scroll view has crossed the threshold from the bottom.
   */
  const [isThresholdCrossed, setThresholdCrossed] = React.useState(false);

  /**
   * Whether or not the "scroll to bottom" button should be visible. This is controlled by the threshold
   * and the current scroll position.
   */
  const [isButtonVisible, setButtonVisible] = React.useState(true);

  /**
   * A callback that is called whenever the scroll view is scrolled. It checks whether or not the
   * scroll view has crossed the threshold from the bottom and updates the state accordingly.
   * The callback is designed to updatr button visibility only when crossing the threshold.
   */
  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;

      const thresholdCrossed =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - threshold;

      setThresholdCrossed(previousState => {
        if (!previousState && thresholdCrossed) {
          setButtonVisible(false);
        }
        if (previousState && !thresholdCrossed) {
          setButtonVisible(true);
        }
        return thresholdCrossed;
      });
    },
    [threshold]
  );

  /**
   * A side effect that calls the `onThresholdCrossed` callback whenever the value of `isThresholdCrossed` changes.
   */
  React.useEffect(() => {
    onThresholdCrossed?.(isThresholdCrossed);
  }, [onThresholdCrossed, isThresholdCrossed]);

  /**
   * A callback that is called whenever the size of the scrollable content changes. It updates the
   * state with the new content height.
   */
  const handleContentSizeChange = React.useCallback(
    (_contentWidth: number, contentHeight: number) => {
      setContentHeight(contentHeight);
    },
    []
  );

  /**
   * A callback that is called whenever the size of the scroll view changes. It updates the state
   * with the new scroll view height.
   */
  const handleLayot = React.useCallback((event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  /**
   * A callback that is called when the "scroll to bottom" button is pressed. It scrolls the
   * scroll view to the bottom and hides the button.
   */
  const handleScrollDownPress = React.useCallback(() => {
    setButtonVisible(false);
    scrollViewRef.current?.scrollToEnd();
  }, [scrollViewRef]);

  /**
   * Whether or not the "scroll to bottom" button needs to be displayed. It is only displayed
   * when the scrollable content cannot fit inside the scroll view and the button is enabled
   * (`scrollEnabled` is `true`).
   */
  const needsScroll = React.useMemo(
    () =>
      scrollViewHeight != null &&
      contentHeight != null &&
      scrollViewHeight < contentHeight,
    [scrollViewHeight, contentHeight]
  );

  /**
   * Whether or not to render the "scroll to bottom" button. It is only rendered when the scroll view
   * is enabled, needs to be scrolled, and the button is visible (`isButtonVisible` is `true`).
   */
  const shouldRenderScrollButton =
    scrollEnabled && needsScroll && isButtonVisible;

  /**
   * The "scroll to bottom" button component. It is wrapped in a reanimated view and has enter and exit
   * animations applied to it.
   */
  const scrollDownButton = (
    <ScaleInOutAnimation
      style={styles.scrollDownButton}
      visible={shouldRenderScrollButton}
    >
      <IconButtonSolid
        testID={"ScrollDownButton"}
        accessibilityLabel="Scroll to bottom"
        icon="arrowBottom"
        onPress={handleScrollDownPress}
      />
    </ScaleInOutAnimation>
  );

  return (
    <>
      <ScrollView
        testID={"ScrollView"}
        ref={scrollViewRef}
        scrollIndicatorInsets={{ right: 1 }}
        scrollEnabled={scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        style={style}
        onLayout={handleLayot}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
      {scrollDownButton}
    </>
  );
};

const styles = StyleSheet.create({
  scrollDownButton: {
    position: "absolute",
    zIndex: 10,
    right: 20,
    bottom: 50
  }
});

export { ForceScrollDownView };
