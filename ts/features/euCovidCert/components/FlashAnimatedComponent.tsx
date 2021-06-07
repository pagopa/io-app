import { Animated, Easing, StyleSheet } from "react-native";
import * as React from "react";
import { Millisecond } from "italia-ts-commons/lib/units";
const styles = StyleSheet.create({
  hover: {
    minWidth: "100%",
    minHeight: "100%",
    bottom: 0,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  }
});
const flashAnimation = 240 as Millisecond;
export type FlashAnimationState = "fadeIn" | "fadeOut" | undefined;

/* an overlay animated view. it is used when screenshot is captured, to simulate flash effect */
export const FlashAnimatedComponent = (props: {
  state: FlashAnimationState;
  animationDuration?: Millisecond;
  onFadeInCompleted?: () => void;
  onFadeOutCompleted?: () => void;
}) => {
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;
  const backgroundInterpolation = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"]
  });
  const fadeOut = () =>
    Animated.timing(backgroundAnimation, {
      duration: props.animationDuration ?? flashAnimation,
      toValue: 0,
      useNativeDriver: false,
      easing: Easing.cubic
    }).start(() => props.onFadeOutCompleted?.());

  const fadeIn = () =>
    Animated.timing(backgroundAnimation, {
      duration: props.animationDuration ?? flashAnimation,
      toValue: 1,
      useNativeDriver: false,
      easing: Easing.cubic
    }).start(() => props.onFadeInCompleted?.());
  React.useEffect(() => {
    if (props.state) {
      switch (props.state) {
        case "fadeIn":
          fadeIn();
          break;
        case "fadeOut":
          fadeOut();
          break;
      }
    }
  }, [props.state]);
  return (
    <Animated.View
      pointerEvents={"none"}
      style={[styles.hover, { backgroundColor: backgroundInterpolation }]}
    />
  );
};
