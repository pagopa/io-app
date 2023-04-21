import React from "react";
import {
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

  const [isThresholdCrossed, setThresholdCrossed] = React.useState(false);
  const [isButtonVisible, setButtonVisible] = React.useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const thresholdCrossed =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - scrollThreshold;

    setThresholdCrossed(thresholdCrossed);
  };

  React.useEffect(() => {
    setButtonVisible(!isThresholdCrossed);
  }, [isThresholdCrossed]);

  const handleScrollDownPress = () => {
    setButtonVisible(false);
    scrollViewRef.current?.scrollToEnd();
  };

  const scrollDownButton = (
    <Animated.View
      key={"scrollDown"}
      style={styles.scrollDownButton}
      entering={ZoomIn.duration(200)}
      exiting={ZoomOut.duration(200)}
    >
      <IconButtonSolid
        accessibilityLabel="Scroll to bottom"
        icon="arrowBottom"
        onPress={handleScrollDownPress}
      />
    </Animated.View>
  );

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        scrollIndicatorInsets={{ right: 1 }}
        scrollEnabled={props.scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        style={[styles.container, props.style]}
        contentContainerStyle={[
          styles.scrollContainer,
          props.contentContainerStyle
        ]}
      >
        {props.children}
      </ScrollView>
      {isButtonVisible && props.scrollEnabled && scrollDownButton}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1
  },
  scrollDownButton: {
    position: "absolute",
    right: 20,
    bottom: 50
  }
});

export { ScrollDownView };
