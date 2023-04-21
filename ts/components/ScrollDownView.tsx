import React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet
} from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import IconButtonSolid from "./ui/IconButtonSolid";

type ForceScrollDownViewProps = {
  children: React.ReactNode;
  threshold?: number;
  onThresholdCrossed?: (crossed: boolean) => void;
} & Pick<ScrollViewProps, "style" | "contentContainerStyle" | "scrollEnabled">;

const ForceScrollDownView = ({
  children,
  threshold = 100,
  style,
  contentContainerStyle,
  scrollEnabled = true,
  onThresholdCrossed
}: ForceScrollDownViewProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [scrollViewHeight, setScrollViewHeight] = React.useState<number>();
  const [contentHeight, setContentHeight] = React.useState<number>();
  const [isThresholdCrossed, setThresholdCrossed] = React.useState(false);
  const [isButtonVisible, setButtonVisible] = React.useState(true);

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

  React.useEffect(() => {
    onThresholdCrossed?.(isThresholdCrossed);
  }, [onThresholdCrossed, isThresholdCrossed]);

  const handleContentSizeChange = React.useCallback(
    (_contentWidth: number, contentHeight: number) => {
      setContentHeight(contentHeight);
    },
    []
  );

  const handleLayot = React.useCallback((event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const handleScrollDownPress = React.useCallback(() => {
    setButtonVisible(false);
    scrollViewRef.current?.scrollToEnd();
  }, [scrollViewRef]);

  const needsScroll = React.useMemo(
    () =>
      scrollViewHeight != null &&
      contentHeight != null &&
      scrollViewHeight < contentHeight,
    [scrollViewHeight, contentHeight]
  );

  const scrollDownButton = (
    <Animated.View
      style={styles.scrollDownButton}
      entering={ZoomIn.duration(200)}
      exiting={ZoomOut.duration(200)}
    >
      <IconButtonSolid
        testID={"ScrollDownButton"}
        accessibilityLabel="Scroll to bottom"
        icon="arrowBottom"
        onPress={handleScrollDownPress}
      />
    </Animated.View>
  );

  const shouldRenderScrollButton =
    scrollEnabled && needsScroll && isButtonVisible;

  return (
    <>
      <ScrollView
        testID={"ScrollDown"}
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
      {shouldRenderScrollButton && scrollDownButton}
    </>
  );
};

const styles = StyleSheet.create({
  scrollDownButton: {
    position: "absolute",
    right: 20,
    bottom: 50
  }
});

export { ForceScrollDownView };
