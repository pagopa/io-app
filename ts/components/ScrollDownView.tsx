import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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

type Props = {
  children: React.ReactNode;
  threshold?: number;
} & Pick<ScrollViewProps, "style" | "contentContainerStyle" | "scrollEnabled">;

const ScrollDownView = (props: Props) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  const scrollThreshold = props.threshold || 100;

  const [scrollViewHeight, setScrollViewHeight] = React.useState<number>();
  const [contentHeight, setContentHeight] = React.useState<number>();
  const [isThresholdCrossed, setThresholdCrossed] = React.useState(false);
  const [isButtonVisible, setButtonVisible] = React.useState(true);

  React.useEffect(() => {
    setButtonVisible(!isThresholdCrossed);
  }, [isThresholdCrossed]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const thresholdCrossed =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - scrollThreshold;

    setThresholdCrossed(thresholdCrossed);
  };

  const handleContentSizeChange = (
    _contentWidth: number,
    contentHeight: number
  ) => {
    setContentHeight(contentHeight);
  };

  const handleLayot = (event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  };

  const handleScrollDownPress = () => {
    setButtonVisible(false);
    scrollViewRef.current?.scrollToEnd();
  };

  const needsScroll = pipe(
    sequenceS(O.Monad)({
      scrollViewHeight: O.fromNullable(scrollViewHeight),
      contentHeight: O.fromNullable(contentHeight)
    }),
    O.map(
      ({ scrollViewHeight, contentHeight }) => scrollViewHeight < contentHeight
    ),
    O.getOrElse(() => false)
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
    props.scrollEnabled && isButtonVisible && needsScroll;

  return (
    <>
      <ScrollView
        testID={"ScrollDown"}
        ref={scrollViewRef}
        scrollIndicatorInsets={{ right: 1 }}
        scrollEnabled={props.scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        style={props.style}
        onLayout={handleLayot}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={props.contentContainerStyle}
      >
        {props.children}
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

export { ScrollDownView };
